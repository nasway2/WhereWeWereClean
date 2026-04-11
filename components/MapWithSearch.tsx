// components/MapWithSearch.tsx
import { firestore, auth } from '../firebaseConfig';
// Удалите импорт из старого firebaseConfig

// Загрузка мест из Firestore
useEffect(() => {
  const unsubscribe = firestore()
    .collection('places')
    .where('roomId', '==', roomId)
    .onSnapshot((snapshot) => {
      const loadedPlaces = [];
      snapshot.forEach((doc) => {
        loadedPlaces.push({ id: doc.id, ...doc.data() });
      });
      setPlaces(loadedPlaces);
    });
  return unsubscribe;
}, []);

// Добавление места
await firestore().collection('places').add({ ... });

// Удаление места
await firestore().collection('places').doc(place.id).delete();