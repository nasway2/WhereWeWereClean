import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';

interface CitySearchWebViewProps {
  visible: boolean;
  onClose: () => void;
  onCitySelect: (city: {
    name: string;
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

export default function CitySearchWebView({
  visible,
  onClose,
  onCitySelect
}: CitySearchWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const getHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
        <title>Поиск городов</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; }
          #search-container { padding: 12px; background: white; border-bottom: 1px solid #ddd; }
          #search-input { width: 100%; padding: 12px 16px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; background: white; }
          #results { list-style: none; padding: 0; margin: 0; }
          .result-item { padding: 14px 16px; border-bottom: 1px solid #eee; background: white; cursor: pointer; }
          .result-item:active { background: #f0f0f0; }
          .result-name { font-size: 16px; font-weight: 500; color: #1a1a1a; }
          .result-address { font-size: 12px; color: #666; margin-top: 4px; }
          .loading, .error { text-align: center; padding: 20px; color: #666; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div id="search-container">
          <input type="text" id="search-input" placeholder="Введите название города или страны..." autocomplete="off">
        </div>
        <div id="results-container"><div class="loading">Введите название для поиска...</div></div>
        <script>
          let searchTimeout;
          const searchInput = document.getElementById('search-input');
          const resultsContainer = document.getElementById('results-container');

          searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            if (query.length < 2) {
              resultsContainer.innerHTML = '<div class="loading">Введите не менее 2 символов...</div>';
              return;
            }
            searchTimeout = setTimeout(() => searchPlaces(query), 500);
          });

          async function searchPlaces(query) {
            resultsContainer.innerHTML = '<div class="loading">Поиск...</div>';
            try {
              const response = await fetch(
                'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=10&addressdetails=1&accept-language=ru'
              );
              const data = await response.json();
              if (data.length === 0) {
                resultsContainer.innerHTML = '<div class="loading">Ничего не найдено</div>';
                return;
              }
              let html = '<ul id="results">';
              data.forEach(place => {
                const name = place.display_name.split(',')[0];
                html += '<li class="result-item" onclick="selectCity(' + place.lat + ', ' + place.lon + ', \'' + name.replace(/'/g, "\\'") + '\', \'' + place.display_name.replace(/'/g, "\\'") + '\')">' +
                  '<div class="result-name">' + name + '</div>' +
                  '<div class="result-address">' + place.display_name + '</div>' +
                '</li>';
              });
              html += '</ul>';
              resultsContainer.innerHTML = html;
            } catch (error) {
              resultsContainer.innerHTML = '<div class="error">Ошибка поиска. Попробуйте ещё раз.</div>';
            }
          }

          function selectCity(lat, lon, name, address) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'citySelected', lat: lat, lng: lon, name: name, address: address }));
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'citySelected') {
        onCitySelect({ name: data.name, lat: data.lat, lng: data.lng, address: data.address });
        onClose();
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Поиск города или страны</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />}
        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ html: getHtml() }}
          onMessage={handleMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { padding: 8 },
  closeButtonText: { fontSize: 16, color: '#007AFF' },
  webview: { flex: 1 },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
});