import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase'; 
import { getFirestore } from "firebase/firestore";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SeeEvent({ route, navigation }) {
  const { eventId } = route.params; // Obtener el ID del evento de los parámetros de navegación
  const [eventData, setEventData] = useState(null);
  const [seats, setSeats] = useState([]); // Estado para los asientos

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const firestore = getFirestore(app);
        const docRef = doc(firestore, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEventData(docSnap.data());
          if (docSnap.data().seats) {
            setSeats(docSnap.data().seats); // Set the seats if they exist
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching event data: ', error);
      }
    };

    fetchEventData();
  }, [eventId]);

  const renderSeats = () => {
    const seatRows = seats.reduce((rows, seat) => {
      rows[seat.row] = rows[seat.row] || [];
      rows[seat.row].push(seat);
      return rows;
    }, {});

    return Object.keys(seatRows).map((row) => (
      <View key={row} style={styles.seatRow}>
        {seatRows[row].map((seat) => (
          <View
            key={`${seat.row}-${seat.col}`}
            style={[
              styles.seat,
              {
                backgroundColor: seat.isAvailable
                  ? getSeatColor(seat.category)
                  : 'red',
              },
            ]}
          />
        ))}
      </View>
    ));
  };

  const getSeatColor = (category) => {
    switch (category) {
      case 'platino':
        return '#e5e4e2';
      case 'oro':
        return '#FFD700';
      case 'plata':
        return '#C0C0C0';
      case 'bronce':
        return '#CD7F32';
      default:
        return '#fff';
    }
  };

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
      <TextInput
        placeholder="Selección de asientos"
        style={styles.input}
        placeholderTextColor="#000" 
        editable={false}
      />
      <View style={styles.categoryBar}>
  <Text style={[styles.categoryText, { backgroundColor: '#e5e4e2' }]}>Platino</Text>
  <Text style={[styles.categoryText, { backgroundColor: '#FFD700' }]}>Oro</Text>
  <Text style={[styles.categoryText, { backgroundColor: '#C0C0C0' }]}>Plata</Text>
  <Text style={[styles.categoryText, { backgroundColor: '#CD7F32' }]}>Bronce</Text>
  <Text style={[styles.categoryText, { backgroundColor: 'red' }]}>Ocupado</Text>
</View>

      <View style={styles.seatContainer}>{renderSeats()}</View>
     
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
    color: '#000'
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
  seatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#DC3545'
  },
  seatContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  seatRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  seat: {
    width: 30,
    height: 30,
    margin: 2,
    borderRadius: 3,
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    borderRadius: 5,
    overflow: 'hidden'
  },
  categoryText: {
    width: 60,
    textAlign: 'center',
    fontSize:11.2,
    padding: 4,
    borderRadius: 5,
    color: '#fff',
    fontWeight: 'bold',
  }
  
});
