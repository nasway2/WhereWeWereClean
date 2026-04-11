// App.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, Text, ActivityIndicator, StyleSheet } from 'react-native';
// Импортируем auth из нашего нового конфига
import { auth } from './firebaseConfig';

// ... LoginScreen компонент ...

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подписываемся на изменения состояния пользователя
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return subscriber; // отписываемся при размонтировании
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={() => setUser(auth().currentUser)} />;
  }

  return <MapWithSearch />;
}