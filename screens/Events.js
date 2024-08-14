import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Image, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../config/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function Events({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('user');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid); // Almacena el ID del usuario
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
                setUserId('');
            }
        });

        return () => unsubscribeAuth();
    }, []);

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

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleAddEvent = () => {
        navigation.navigate('AddEvent');
    };

    const handleSeeEvent = (eventId) => {
        navigation.navigate('SeeEvent', { eventId });
    };

    const handleCancelEvent = (eventId) => {
        Alert.alert(
            "Confirmar Cancelación",
            "¿Estás seguro de que quieres cancelar este evento?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        try {
                            const eventRef = doc(db, 'events', eventId);
                            const eventSnap = await getDoc(eventRef);
                            
                            if (!eventSnap.exists()) {
                                console.log("El evento no existe.");
                                return;
                            }
                            
                            const eventData = eventSnap.data();
                            const eventName = eventData.eventName; // Nombre del evento
    
                            // Iniciar una operación batch para realizar varias escrituras a la vez
                            const batch = writeBatch(db);
                            
                            // Obtener los tickets relacionados con este evento
                            const ticketsQuery = query(
                                collection(db, 'tickets'),
                                where('eventId', '==', eventId)
                            );
                            const ticketsSnapshot = await getDocs(ticketsQuery);
    
                            // Crear un array para almacenar los userId
                            const userIds = [];
    
                            // Actualizar cada ticket y recolectar userId
                            for (const ticketDoc of ticketsSnapshot.docs) {
                                const ticketRef = doc(db, 'tickets', ticketDoc.id);
                                batch.update(ticketRef, { available: false });
                                
                                // Recuperar el userId de cada ticket
                                const ticketData = ticketDoc.data();
                                userIds.push(ticketData.userId);
                            }
    
                            // Cancelar el evento
                            batch.update(eventRef, { eventAvailable: false });
    
                            // Actualizar el campo 'alerts' de cada usuario
                            for (const userId of userIds) {
                                const userDocRef = doc(db, 'users', userId);
                                const userDocSnap = await getDoc(userDocRef);
    
                                if (userDocSnap.exists()) {
                                    const userData = userDocSnap.data();
                                    const alerts = userData.alerts || []; // Obtener alertas previas o inicializar un array vacío
    
                                    alerts.push(`El evento "${eventName}" fue cancelado, tus tickets ya no estarán disponibles y tu dinero te será devuelto.`);
                                    batch.update(userDocRef, { alerts: alerts });
                                    console.log("Alerts after update:", alerts); // Este log debe mostrar las alertas después de actualizar

                                } else {
                                    console.log(`User ID: ${userId} no encontrado en la colección users`);
                                }
                            }
    
                            // Ejecutar todas las actualizaciones
                            await batch.commit();
    
                            console.log("Evento y tickets cancelados correctamente, alertas enviadas.");
                        } catch (error) {
                            console.error("Error cancelando el evento: ", error);
                        }
                    }
                }
            ]
        );
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
                    {item.userId === userId && (
                        <>
                            <Text style={styles.ownershipLabel}>Este evento te pertenece</Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelEvent(item.id)}>
                                <Text style={styles.cancelButtonText}>Cancelar Evento</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const filteredEvents = events.filter(event => 
        event.eventAvailable && (
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            event.artistName.toLowerCase().includes(searchQuery.toLowerCase())
        )
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
    },
    locationText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 5,
    },
    ownershipLabel: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#DC3545',
    },
    cancelButton: {
        marginTop: 10,
        backgroundColor: '#DC3545',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});
