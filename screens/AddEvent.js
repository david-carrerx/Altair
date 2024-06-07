import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddEvent(props) {
  const [artistName, setArtistName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ticketPrices, setTicketPrices] = useState({
    platinum: { price: '', quantity: '' },
    gold: { price: '', quantity: '' },
    silver: { price: '', quantity: '' },
    bronze: { price: '', quantity: '' },
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState(['Rock', 'Pop', 'Jazz', 'Clásica', 'Reggaetón']);
  const [newCategory, setNewCategory] = useState('');
  const [fieldsFilled, setFieldsFilled] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    checkFields();
  }, [eventName, eventCategory, eventDescription]);

  const checkFields = () => {
    if (eventName && eventCategory && eventDescription) {
      setFieldsFilled(true);
    } else {
      setFieldsFilled(false);
    }
  };

  const handleTicketChange = (category, key, value) => {
    setTicketPrices(prevState => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [key]: value,
      },
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const handleClearFields = () => {
    setArtistName('');
    setEventName('');
    setEventCategory('');
    setEventDescription('');
    setSelectedDate(new Date());
    setTicketPrices({
      platinum: { price: '', quantity: '' },
      gold: { price: '', quantity: '' },
      silver: { price: '', quantity: '' },
      bronze: { price: '', quantity: '' },
    });
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
    if (newCategory.trim() !== '') {
      setCategories(prevCategories => [...prevCategories, newCategory]);
      setEventCategory(newCategory);
      setModalVisible(false);
      setNewCategory('');
    }
  };

  const handleImageAdd = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.cancelled) {
      const source = { uri: pickerResult.uri };
      setImages(prevImages => [...prevImages, source]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Nombre del evento"
        style={styles.input}
        onChangeText={text => setEventName(text)}
        value={eventName}
      />
      <TextInput
        placeholder="Nombre del artista o grupo"
        style={styles.input}
        onChangeText={text => setArtistName(text)}
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
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
            />
            <View style={styles.addCategoryContainer}>
              <TextInput
                placeholder="Otra"
                style={styles.newCategoryInput}
                onChangeText={text => setNewCategory(text)}
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
        onChangeText={text => setEventDescription(text)}
        value={eventDescription}
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.imageContainer} onPress={handleImageAdd}>
        <Image source={require('../assets/add.png')} style={styles.addImage} />
        <Text style={styles.imageText}>Agrega al menos 3 imágenes del artista aquí</Text>
      </TouchableOpacity>
      <View style={styles.imageList}>
        {images.map((image, index) => (
          <Image key={index} source={image} style={styles.imageItem} />
        ))}
      </View>
      <View style={styles.mapContainer}>
        {/* Aquí irá el mapa interactivo */}
      </View>
      <View style={styles.complexContainer}>
        <Image source={require('../assets/add.png')} style={styles.addImage} />
        <Text style={styles.imageText}>Agrega imágenes del complejo aquí</Text>
      </View>
      <TextInput
        placeholder="Fecha"
        style={styles.input}
        onChangeText={text => setEventCategory(text)}
      />
      <TextInput
        placeholder="Hora"
        style={styles.input}
        onChangeText={text => setEventCategory(text)}
      />
      <View style={styles.ticketContainer}>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Platino:</Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.platinum.price}
            onChangeText={text => handleTicketChange('platinum', 'price', text.replace(/[^0-9.]/g, ''))} // Solo permitir números y el punto decimal
            keyboardType="numeric"
            maxLength={10} // Longitud máxima del campo
            textAlign="right" // Alinear el texto a la derecha
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.platinum.quantity}
            onChangeText={text => handleTicketChange('platinum', 'quantity', text.replace(/[^0-9]/g, ''))} // Solo permitir números
            keyboardType="numeric"
            maxLength={5} // Longitud máxima del campo
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Oro:       </Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.gold.price}
            onChangeText={text => handleTicketChange('gold', 'price', text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            maxLength={10}
            textAlign="right"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.gold.quantity}
            onChangeText={text => handleTicketChange('gold', 'quantity', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Plata:    </Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.silver.price}
            onChangeText={text => handleTicketChange('silver', 'price', text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            maxLength={10}
            textAlign="right"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.silver.quantity}
            onChangeText={text => handleTicketChange('silver', 'quantity', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Bronce:</Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.bronze.price}
            onChangeText={text => handleTicketChange('bronze', 'price', text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            maxLength={10}
            textAlign="right"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.bronze.quantity}
            onChangeText={text => handleTicketChange('bronze', 'quantity', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, fieldsFilled ? null : styles.disabledButton]}
          disabled={!fieldsFilled}
        >
          <Text style={styles.buttonText}>Registrar evento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClearFields}>
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Eliminar evento</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 15,
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
  imageContainer: {
    width: '100%',
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  addImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  imageText: {
    fontSize: 14,
    color: '#ccc',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  complexContainer: {
    width: '100%',
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  ticketContainer: {
    width: '100%',
    marginBottom: 15,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  ticketCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketInput: {
    width: '40%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  ticket: {
    color: '#949492',
    fontWeight: 'bold',
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
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageItem: {
    width: '30%',
    height: 100,
    marginBottom: 10,
  },
});


