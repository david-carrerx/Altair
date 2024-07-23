import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';

const numRows = 5;
const numCols = 5;
const maxTotalSeats = 25;

const initialCategories = {
  platino: { color: 'gray', seats: 0 },
  oro: { color: '#e6a612', seats: 0 },
  plata: { color: '#bbbb', seats: 0 },
  bronce: { color: '#b56d5e', seats: 0 },
};

const initialSeats = Array.from({ length: numRows }, () =>
  Array.from({ length: numCols }, () => ({
    category: null,
    isAvailable: true,
  }))
);

export default function SeatSelection({ onSeatsChange }) {
  const [seats, setSeats] = useState(initialSeats);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(initialCategories);

  const handleSeatPress = (rowIndex, colIndex) => {
    setSeats(prevSeats => {
      const newSeats = [...prevSeats];
      const seat = newSeats[rowIndex][colIndex];
  
      if (selectedCategory === null) {
        return newSeats; // No se ha seleccionado una categoría, no hacer cambios en los asientos
      }
  
      if (!seat.isAvailable && seat.category === selectedCategory) {
        // El asiento ya está ocupado por la misma categoría, revertirlo a disponible
        newSeats[rowIndex][colIndex] = {
          category: null,
          isAvailable: true,
        };
        setCategories(prevCategories => ({
          ...prevCategories,
          [selectedCategory]: {
            ...prevCategories[selectedCategory],
            seats: prevCategories[selectedCategory].seats + 1,
          },
        }));
      } else if (categories[selectedCategory].seats > 0) {
        // Asignar la categoría seleccionada al asiento si hay asientos disponibles
        newSeats[rowIndex][colIndex] = {
          category: selectedCategory,
          isAvailable: false,
        };
        setCategories(prevCategories => ({
          ...prevCategories,
          [selectedCategory]: {
            ...prevCategories[selectedCategory],
            seats: prevCategories[selectedCategory].seats - 1,
          },
        }));
      } else {
        Alert.alert('Asientos agotados', `No quedan asientos disponibles en la categoría ${selectedCategory}.`);
      }
  
      onSeatsChange(newSeats); // Llamar a la prop onSeatsChange con los asientos actualizados
      return newSeats;
    });
  };
  

  const handleSeatInputChange = (category, value) => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue)) {
      const totalSeats = Object.keys(categories).reduce((sum, cat) => {
        return sum + (cat === category ? newValue : categories[cat].seats);
      }, 0);

      if (totalSeats > maxTotalSeats) {
        Alert.alert('Límite excedido', `La cantidad total de asientos no puede exceder de ${maxTotalSeats}.`);
      } else {
        setCategories(prevCategories => ({
          ...prevCategories,
          [category]: {
            ...prevCategories[category],
            seats: newValue,
          },
        }));
      }
    }
  };

  const renderSeat = ({ item: rowData, index: rowIndex }) => (
    <View style={styles.row}>
      {rowData.map((seat, colIndex) => (
        <TouchableOpacity
          key={`${rowIndex}-${colIndex}`}
          style={[
            styles.seat,
            {
              backgroundColor: seat.isAvailable
                ? 'white'
                : categories[seat.category]?.color || 'white',
            },
          ]}
          onPress={() => handleSeatPress(rowIndex, colIndex)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        {Object.keys(categories).map(category => (
          <View key={category} style={styles.categoryInputContainer}>
            <Text style={styles.categoryLabel}>{category}</Text>
            <TextInput
              style={styles.categoryInput}
              keyboardType="numeric"
              value={categories[category].seats.toString()}
              onChangeText={value => handleSeatInputChange(category, value)}
            />
          </View>
        ))}
      </View>
      <View style={styles.categoryContainer}>
        {Object.keys(categories).map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category ? categories[category].color : '#ccc',
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryButtonText}>{categories[category].seats} asientos</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={seats}
        renderItem={renderSeat}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
  seat: {
    width: 19.5,
    height: 19.5,
    margin: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 5,
  },
  categoryInput: {
    width: 50,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  categoryButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
