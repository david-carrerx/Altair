import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase'; 
import { getFirestore, GeoPoint } from "firebase/firestore";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SeeEvent({ route, navigation }) {
  const { eventId } = route.params; // Obtener el ID del evento de los parámetros de navegación
  const [eventData, setEventData] = useState(null);
  const [seats, setSeats] = useState([]);


  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const firestore = getFirestore(app);
        const docRef = doc(firestore, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEventData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching event data: ', error);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (!eventData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}>
        <View style={styles.posterContainer}>
        {eventData.poster ? (
          <Image source={{ uri: eventData.poster }} style={styles.posterImage} />
        ) : (
          <Text style={styles.posterText}>No hay póster disponible</Text>
        )}
      </View>
      <TextInput
        placeholder="Nombre del evento"
        style={styles.input}
        value={eventData.eventName}
        editable={false}
      />
      <TextInput
        placeholder="Nombre del artista o grupo"
        style={styles.input}
        value={eventData.artistName}
        editable={false}
      />
      <TextInput
        placeholder="Categoría del evento"
        style={styles.input}
        value={eventData.eventCategory}
        editable={false}
      />
      <TextInput
        placeholder="Descripción del evento"
        style={[styles.input, styles.textArea]}
        value={eventData.eventDescription}
        multiline={true}
        numberOfLines={4}
        editable={false}
      />
      
      <TextInput
        placeholder="Fecha del evento"
        style={styles.input}
        value={eventData.eventDate.toDate().toDateString()}
        editable={false}
      />
      <TextInput
        placeholder="Nombre de la ubicación"
        style={styles.input}
        value={eventData.locationName}
        editable={false}
      />
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{
            latitude: eventData.location.latitude,
            longitude: eventData.location.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04,
          }}
        >
          <Marker
            coordinate={{
              latitude: eventData.location.latitude,
              longitude: eventData.location.longitude,
            }}
          />
        </MapView>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  posterContainer: {
    width: '100%',
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DC3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#DC3545',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
