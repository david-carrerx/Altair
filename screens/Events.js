import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../config/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function Events({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('user');

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events: ", error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUserRole(userData.role.toLowerCase());
                } else {
                    console.log('No such document!');
                }
            } else {
                setUserRole('user');
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleAddEvent = () => {
        navigation.navigate('AddEvent');
    };

    const handleSeeEvent = (eventId) => {
        navigation.navigate('SeeEvent', { eventId });
    };

    const renderEventItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleSeeEvent(item.id)}>
            <View style={styles.card}>
                <Image source={{ uri: item.poster }} style={styles.eventPoster} />
                <View style={styles.cardContent}>
                    <Text style={styles.eventName}>{item.eventName}</Text>
                    <Text style={styles.artistName}>{item.artistName}</Text>
                    <Text style={styles.eventDate}>Fecha: {item.eventDate.toDate().toLocaleDateString()}</Text>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color="#555"/>
                        <Text style={styles.locationText}>{item.locationName}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity> 
    );

    const filteredEvents = events.filter(event => 
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {userRole === 'admin' && (
                <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                    <Text style={styles.addButtonText}>Agregar Evento</Text>
                </TouchableOpacity>
            )}
            {loading ? (
                <Text>Cargando...</Text>
            ) : filteredEvents.length === 0 ? (
                <View style={styles.rectangle}>
                    <Image source={require('../assets/event.png')} style={styles.eventIcon} />
                    <Text style={styles.rectangleText}>
                        {userRole === 'admin' 
                            ? 'Aquí aparecerán los eventos que agregues' 
                            : 'No hay eventos disponibles'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    renderItem={renderEventItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            )}
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    eventPoster: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 10,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    artistName: {
        fontSize: 14,
        color: '#555',
        fontWeight: 'bold'
    },
    eventDate: {
        fontSize: 14,
        color: '#555',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        fontWeight: 'bold'
    },
    locationText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 5,
       // Añadir margen para separar el ícono del texto
    },
});
