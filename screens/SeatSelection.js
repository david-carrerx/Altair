import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';

const numRows = 15;
const numCols = 15;

const categories = {
  platino: { color: 'gray', seats: 5 },
  oro: { color: 'yellow', seats: 8 },
  plata: { color: '#bbbb', seats: 10 },
  bronce: { color: 'brown', seats: 15 },
};

const initialSeats = Array.from({ length: numRows }, () =>
  Array.from({ length: numCols }, () => ({
    category: null,
    isAvailable: true,
  }))
);

export default function SeatSelection() {
  const [seats, setSeats] = useState(initialSeats);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
        categories[selectedCategory].seats += 1; // Incrementar el contador de asientos
      } else if (categories[selectedCategory].seats > 0) {
        // Asignar la categoría seleccionada al asiento si hay asientos disponibles
        newSeats[rowIndex][colIndex] = {
          category: selectedCategory,
          isAvailable: false,
        };
        categories[selectedCategory].seats -= 1; // Decrementar el contador de asientos
      } else {
        Alert.alert('Asientos agotados', `No quedan asientos disponibles en la categoría ${selectedCategory}.`);
      }

      return newSeats;
    });
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
