import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function AddEvent(props) {
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
    props.navigation.navigate('Events'); // Navegar de vuelta a la ventana de eventos
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Nombre del artista o grupo"
        style={styles.input}
        onChangeText={text => setEventName(text)}
        value={eventName}
      />
      <TextInput
        placeholder="Categoría"
        style={styles.input}
        onChangeText={text => setEventCategory(text)}
        value={eventCategory}
      />
      <TextInput
        placeholder="Descripción del evento"
        style={[styles.input, styles.textArea]}
        onChangeText={text => setEventDescription(text)}
        value={eventDescription}
        multiline={true}
        numberOfLines={4}
      />
      <View style={styles.imageContainer}>
        <Image source={require('../assets/add.png')} style={styles.addImage} />
        <Text style={styles.imageText}>Agrega al menos 3 imágenes del artista aquí</Text>
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
            onChangeText={text => handleTicketChange('platinum', 'price', text)}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.platinum.quantity}
            onChangeText={text => handleTicketChange('platinum', 'quantity', text)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Oro:</Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.gold.price}
            onChangeText={text => handleTicketChange('gold', 'price', text)}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.gold.quantity}
            onChangeText={text => handleTicketChange('gold', 'quantity', text)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Plata:</Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.silver.price}
            onChangeText={text => handleTicketChange('silver', 'price', text)}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.silver.quantity}
            onChangeText={text => handleTicketChange('silver', 'quantity', text)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.ticketCategory}>
          <Text style={styles.ticket}>Bronce:</Text>
          <TextInput
            placeholder="Precio"
            style={styles.ticketInput}
            value={ticketPrices.bronze.price}
            onChangeText={text => handleTicketChange('bronze', 'price', text)}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Cantidad"
            style={styles.ticketInput}
            value={ticketPrices.bronze.quantity}
            onChangeText={text => handleTicketChange('bronze', 'quantity', text)}
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
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
});
