import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

export default function Events({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleAddEvent = () => {
        navigation.navigate('AddEvent');
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Buscar evento"
                    onChangeText={(text) => setSearchQuery(text)}
                    value={searchQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                <Text style={styles.addButtonText}>Agregar Evento</Text>
            </TouchableOpacity>
            <View style={styles.rectangle}>
                <Image source={require('../assets/event.png')} style={styles.eventIcon} />
                <Text style={styles.rectangleText}>Aquí aparecerán los eventos que agregues</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fcfcfc',
        borderRadius: 5,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginRight: 5,
    },
    searchButton: {
        backgroundColor: '#842029',
        borderRadius: 5,
        padding: 10,
    },
    addButton: {
        backgroundColor: '#DC3545',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    rectangle: {
        backgroundColor: '#fcfcfc',
        borderRadius: 10,
        padding: 20, 
        alignItems: 'center',
        borderStyle: 'dashed', 
        borderWidth: 2, 
        borderColor: '#B8B8B8' 
        
    },
    eventIcon: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    rectangleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#B8B8B8',
        textAlign: 'center'
    },
});
