import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  TextInput,
  Button
} from 'react-native';
import MapView, { Marker, LongPressEvent } from 'react-native-maps';
import { firestore, auth } from '../firebaseConfig';
import CitySearchWebView from './CitySearchWebView';

interface Place {
  id: string;
  lat: number;
  lng: number;
  title: string;
  comment: string;
  date: string;
  addedBy: string;
}

export default function MapWithSearch() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlace, setNewPlace] = useState({ lat: 0, lng: 0 });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const roomId = 'main_room';

  // Загрузка мест из Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('places')
      .where('roomId', '==', roomId)
      .onSnapshot((snapshot) => {
        const loadedPlaces: Place[] = [];
        snapshot.forEach((doc) => {
          loadedPlaces.push({ id: doc.id, ...doc.data() } as Place);
        });
        setPlaces(loadedPlaces);
      });
    return unsubscribe;
  }, []);

  const handleCitySelect = (city: { name: string; lat: number; lng: number; address: string }) => {
    mapRef.current?.animateToRegion({
      latitude: city.lat,
      longitude: city.lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
    
    Alert.alert(
      'Добавить место?',
      `${city.name}\n${city.address}\n\nХотите добавить этот город в вашу коллекцию?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Добавить', 
          onPress: () => {
            setNewPlace({ lat: city.lat, lng: city.lng });
            setTitle(city.name);
            setComment(city.address);
            setModalVisible(true);
          }
        }
      ]
    );
  };

  const savePlace = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название места');
      return;
    }

    try {
      await firestore().collection('places').add({
        roomId: roomId,
        lat: newPlace.lat,
        lng: newPlace.lng,
        title: title,
        comment: comment,
        date: new Date().toISOString().split('T')[0],
        addedBy: auth().currentUser?.email || 'anonymous',
      });

      setModalVisible(false);
      setTitle('');
      setComment('');
      Alert.alert('Успех', 'Место добавлено!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить');
      console.error(error);
    }
  };

  const deletePlace = async (place: Place) => {
    Alert.alert('Удалить место?', place.title, [
      { text: 'Отмена', style: 'cancel' },
      { 
        text: 'Удалить', 
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('places').doc(place.id).delete();
            Alert.alert('Успех', 'Место удалено');
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        }
      }
    ]);
  };

  const handleLongPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewPlace({ lat: latitude, lng: longitude });
    setTitle('');
    setComment('');
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onLongPress={handleLongPress}
        initialRegion={{
          latitude: 55.751244,
          longitude: 37.618423,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.title}
            description={place.date}
            onPress={() => deletePlace(place)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.searchButton} onPress={() => setSearchVisible(true)}>
        <Text style={styles.searchButtonText}>🔍 Поиск города</Text>
      </TouchableOpacity>

      <CitySearchWebView
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onCitySelect={handleCitySelect}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Новое место</Text>
            <TextInput placeholder="Название *" value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput placeholder="Комментарий" value={comment} onChangeText={setComment} multiline style={[styles.input, { height: 80 }]} />
            <Button title="Сохранить" onPress={savePlace} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchButton: { position: 'absolute', top: 20, right: 20, backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, elevation: 5, zIndex: 1 },
  searchButtonText: { fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
});