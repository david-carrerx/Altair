import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import { app } from '../config/firebase'; 
import { getFirestore, collection, addDoc, GeoPoint } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import SeatSelection from './SeatSelection'; // Importa el nuevo componente

export default function AddEvent(props) {
  const [artistName, setArtistName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [categories, setCategories] = useState(['Rock', 'Pop', 'Jazz', 'Clásica', 'Reggaetón']);
  const [newCategory, setNewCategory] = useState('');
  const [fieldsFilled, setFieldsFilled] = useState(false);
  const [destination, setDestination] = useState({ latitude: 24.033920, longitude: -104.645619 });
  const [modalVisible, setModalVisible] = useState(false);
  const [places, setPlaces] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [poster, setPoster] = useState(null);
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventDateTime, setEventDateTime] = useState(new Date());
  const [locationName, setLocationName] = useState('');
const [showDateTimePicker, setShowDateTimePicker] = useState(false);


  useEffect(() => {
    checkFields();
  }, [eventName, eventCategory, eventDescription, poster, eventDate]);

  const checkFields = () => {
    const currentDate = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(currentDate.getMonth() + 6);

    setFieldsFilled(
      eventName && 
      eventCategory && 
      eventDescription && 
      poster && 
      eventDate >= sixMonthsLater
    );
  };

  const handleClearFields = () => {
    setArtistName('');
    setEventName('');
    setEventCategory('');
    setEventDescription('');
    setPoster(null);
    setDestination({ latitude: 24.033920, longitude: -104.645619 });
    setEventDate(new Date());
    props.navigation.navigate('Events');
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setEventCategory(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setEventCategory(newCategory);
      setModalVisible(false);
      setNewCategory('');
    }
  };

  const fetchPlaces = async (input) => {
    if (input.length > 2) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=AIzaSyCdcq28BPIbYHUOdnCYQB0BzoCjE75Z0iw`
      );
      const data = await response.json();
      setPlaces(data.predictions);
    }
  };

  const handlePlaceSelect = async (placeId) => {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyCdcq28BPIbYHUOdnCYQB0BzoCjE75Z0iw`
    );
    const data = await response.json();
    const location = data.result.geometry.location;
    setDestination({ latitude: location.lat, longitude: location.lng });
    setPlaces([]);
    setSearchInput(data.result.name);
    setLocationName(data.result.name); // Establecer el nombre de la ubicación aquí
};

  const handleRegisterEvent = async () => {
    try {
      const firestore = getFirestore(app);
      const storage = getStorage(app);
  
      // Subir la imagen a Firebase Storage
      const storageRef = ref(storage, `event_posters/${Date.now()}`);
      await uploadBytes(storageRef, await fetch(poster).then((res) => res.blob()));
  
      // Obtener la URL de descarga de la imagen subida
      const posterUrl = await getDownloadURL(storageRef);
  
      // Guardar los datos del evento en Firestore
      await addDoc(collection(firestore, 'events'), {
        artistName,
        eventName,
        eventCategory,
        eventDescription,
        location: new GeoPoint(destination.latitude, destination.longitude),
        locationName, 
        eventDate,
        poster: posterUrl, // Guardar la URL de la imagen en Firestore
      });
  
      // Limpiar los estados después de guardar
      setArtistName('');
      setEventName('');
      setEventCategory('');
      setEventDescription('');
      setPoster(null);
      setDestination({ latitude: 24.033920, longitude: -104.645619 });
      setLocationName('');
      setEventDate(new Date());
      setSearchInput('');
      setPlaces([]);
  
      // Navegar de regreso a la lista de eventos
      props.navigation.navigate('Events');
    } catch (error) {
      console.error('Error al agregar el evento: ', error);
    }
  };

  

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setPoster(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}>
      <TextInput
        placeholder="Nombre del evento"
        style={styles.input}
        onChangeText={setEventName}
        value={eventName}
      />
      <TextInput
        placeholder="Nombre del artista o grupo"
        style={styles.input}
        onChangeText={setArtistName}
        value={artistName}
      />
      <TouchableOpacity style={styles.pickerContainer} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerText}>{eventCategory || 'Seleccione una categoría'}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList data={categories} renderItem={renderCategoryItem} keyExtractor={(item) => item} />
            <View style={styles.addCategoryContainer}>
              <TextInput
                placeholder="Otra"
                style={styles.newCategoryInput}
                onChangeText={setNewCategory}
                value={newCategory}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddNewCategory}>
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TextInput
        placeholder="Descripción del evento"
        style={[styles.input, styles.textArea]}
        onChangeText={setEventDescription}
        value={eventDescription}
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.posterContainer} onPress={pickImage}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.posterImage} />
        ) : (
          <Text style={styles.posterText}>Subir póster del evento</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerText}>{eventDate.toDateString() || 'Seleccione una fecha'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || eventDate;
            setShowDatePicker(false);
            setEventDate(currentDate);
          }}
          minimumDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
        />
      )}
      <TextInput
        placeholder="Buscar lugares"
        style={styles.input}
        onChangeText={(text) => {
          setSearchInput(text);
          fetchPlaces(text);
        }}
        value={searchInput}
      />
      {places.length > 0 && (
        <FlatList
          data={places}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePlaceSelect(item.place_id)} style={styles.placeItem}>
              <Text style={styles.placeText}>{item.description}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.place_id}
          style={styles.placesList}
        />
      )}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{
            latitude: destination.latitude,
            longitude: destination.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04,
          }}
        >
          <Marker
            draggable
            coordinate={destination}
            onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
          />
        </MapView>
      </View>
      
      <SeatSelection /> 
      
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, fieldsFilled ? null : styles.disabledButton]}
          disabled={!fieldsFilled}
          onPress={handleRegisterEvent} 
        >
          <Text style={styles.buttonText}>Registrar evento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClearFields}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Eliminar evento</Text>
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 15
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryText: {
    fontSize: 16,
  },
  addCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  newCategoryInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#DC3545',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addButtonText: {
    color: '#fff',
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
  disabledButton: {
    backgroundColor: '#ccc',
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
  placesList: {
    width: '100%',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  placeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  placeText: {
    fontSize: 16,
  },
  placeInfoText: {
    fontSize: 16,
    marginBottom: 10,
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
  },
  posterText: {
    fontSize: 16,
    color: '#000',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  datePickerButton: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#000',
  },
});
