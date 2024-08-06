import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase'; 
import { getFirestore } from "firebase/firestore";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { onSnapshot } from 'firebase/firestore';
import PaymentModal from './PaymentModal';
import { Ionicons } from '@expo/vector-icons';

export default function SeeEvent({ route, navigation }) {
  const { eventId } = route.params; 
  const [eventData, setEventData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const auth = getAuth();
  const firestore = getFirestore(app);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const docRef = doc(firestore, 'events', eventId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setEventData(docSnap.data());
            if (docSnap.data().seats) {
              setSeats(docSnap.data().seats);
            }
          } else {
            console.log('No such document!');
          }
        });
  
        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching event data: ', error);
      }
    };
  
    fetchEventData();
  }, [eventId]);

  const handleSeatSelect = (seat) => {
    if (seat.isAvailable) {
      setSelectedSeat(selectedSeat === seat ? null : seat);
    }
  };

  const handlePurchase = async () => {
    if (!selectedSeat) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Debes estar autenticado para comprar un boleto.');
        return;
      }
  
      // Actualizar el asiento en la colección de eventos
      const eventRef = doc(firestore, 'events', eventId);
      await updateDoc(eventRef, {
        seats: seats.map(seat =>
          seat.row === selectedSeat.row && seat.col === selectedSeat.col
            ? { ...seat, isAvailable: false, purchasedBy: user.uid }
            : seat
        ),
      });
  
      // Agregar el boleto a la colección de tickets
      const ticketRef = doc(firestore, 'tickets', `${user.uid}_${eventId}_${selectedSeat.row}-${selectedSeat.col}`);
      await setDoc(ticketRef, {
        userId: user.uid,
        eventId: eventId,
        seat: {
          row: selectedSeat.row,
          col: selectedSeat.col,
          category: selectedSeat.category,
        },
        poster: eventData.poster,
        purchaseDate: Timestamp.now(),
      });

      alert('Asiento comprado');
      navigation.goBack();
      setSelectedSeat(null);
    } catch (error) {
      console.error('Error purchasing seat: ', error);
      alert('Error al comprar el boleto.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalVisible(false);
    handlePurchase();
  };

  const renderSeats = () => {
    const seatRows = seats.reduce((rows, seat) => {
      rows[seat.row] = rows[seat.row] || [];
      rows[seat.row].push(seat);
      return rows;
    }, {});

    return Object.keys(seatRows).map((row) => (
      <View key={row} style={styles.seatRow}>
        {seatRows[row].map((seat) => (
          <TouchableOpacity
            key={`${seat.row}-${seat.col}`}
            onPress={() => handleSeatSelect(seat)}
            disabled={!seat.isAvailable}
          >
            <View
              style={[
                styles.seat,
                {
                  backgroundColor: selectedSeat === seat
                    ? 'green'
                    : seat.isAvailable
                    ? getSeatColor(seat.category)
                    : 'red',
                },
              ]}
            />
          </TouchableOpacity>
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} enableOnAndroid={true}>
      
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
        <View style={styles.categoryBar}>
          <TextInput
            style={[styles.categoryText, { backgroundColor: '#e5e4e2' }]}
            value={`$${eventData.prices.platino || 'N/A'}`}
            editable={false}
          />
          <TextInput
            style={[styles.categoryText, { backgroundColor: '#FFD700' }]}
            value={`$${eventData.prices.oro || 'N/A'}`}
            editable={false}
          />
          <TextInput
            style={[styles.categoryText, { backgroundColor: '#C0C0C0' }]}
            value={`$${eventData.prices.plata || 'N/A'}`}
            editable={false}
          />
          <TextInput
            style={[styles.categoryText, { backgroundColor: '#CD7F32' }]}
            value={`$${eventData.prices.bronce || 'N/A'}`}
            editable={false}
          />
          <TextInput
            style={[styles.categoryText, { backgroundColor: 'red' }]}
            value={`N/A`}
            editable={false}
          />
        </View>
        <View style={styles.seatContainer}>{renderSeats()}</View>
      </KeyboardAwareScrollView>
      {selectedSeat && (
        <View style={styles.selectedSeatContainer}>
          <Text style={styles.selectedSeatText}>
            Asiento: {selectedSeat.row}-{selectedSeat.col} | 
            Categoría: {selectedSeat.category} | 
            Precio: ${eventData.prices[selectedSeat.category] || 'N/A'}
          </Text>
          <TouchableOpacity style={styles.purchaseButton} onPress={() => setIsPaymentModalVisible(true)}>
            <Text style={styles.purchaseButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <PaymentModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirm={handlePaymentSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  posterText: {
    fontSize: 16,
    color: '#888',
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
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
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
    color: '#DC3545',
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
    overflow: 'hidden',
  },
  categoryText: {
    width: 60,
    textAlign: 'center',
    fontSize: 11.2,
    padding: 4,
    borderRadius: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedSeatContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 15,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSeatText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  purchaseButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#DC3545',
    padding: 10,
    borderRadius: 50, // Redondea el botón para que sea circular
    elevation: 5, // Para sombra en Android
    shadowColor: '#000', // Para sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  },
});
