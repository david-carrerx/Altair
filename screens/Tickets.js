import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Alert, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";

export default function Tickets({ navigation }) {
    const auth = getAuth();
    const db = getFirestore();
    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
            if (userAuth) {
                const docRef = doc(db, "users", userAuth.uid);
                getDoc(docRef).then(docSnap => {
                    if (docSnap.exists()) {
                        setUser(docSnap.data());
                        
                        // Obtener boletos comprados del usuario en tiempo real
                        const ticketsQuery = query(
                            collection(db, "tickets"),
                            where("userId", "==", userAuth.uid)
                        );
                        const unsubscribeTickets = onSnapshot(ticketsQuery, (querySnapshot) => {
                            const ticketsData = querySnapshot.docs
                                .map(doc => doc.data())
                                .filter(ticket => ticket.available); // Filtrar boletos disponibles
                            setTickets(ticketsData);
                        });

                        // Cleanup subscriptions on unmount
                        return () => {
                            unsubscribeTickets();
                        };
                    } else {
                        console.log("No such document!");   
                    }
                }).catch(error => console.error("Error getting user data: ", error));
            } else {
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribeAuth();
        };
    }, [auth, db]);

    const cancelTicket = async (ticket) => {
        try {
            const ticketRef = doc(db, "tickets", `${ticket.userId}_${ticket.eventId}_${ticket.seat.row}-${ticket.seat.col}`);
            await deleteDoc(ticketRef);

            // Update the event seats to be available again
            const eventRef = doc(db, "events", ticket.eventId);
            const eventDoc = await getDoc(eventRef);
            const eventData = eventDoc.data();
            const updatedSeats = eventData.seats.map(seat =>
                seat.row === ticket.seat.row && seat.col === ticket.seat.col
                    ? { ...seat, isAvailable: true, purchasedBy: null }
                    : seat
            );
            await updateDoc(eventRef, { seats: updatedSeats });

            // Remove the cancelled ticket from the state
            setTickets(tickets.filter(t => t !== ticket));

            alert('Boleto cancelado exitosamente.');
        } catch (error) {
            console.error('Error cancelando el boleto: ', error);
            alert('Error al cancelar el boleto.');
        }
    };

    const handleCancel = (ticket) => {
        Alert.alert(
            'Confirmar cancelación',
            '¿Estás seguro de que quieres cancelar este boleto?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancelación de boleto cancelada'),
                    style: 'cancel',
                },
                {
                    text: 'Sí',
                    onPress: () => cancelTicket(ticket),
                },
            ],
            { cancelable: false }
        );
    };

    const renderTicket = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.poster }} style={styles.posterImage} />
            <View style={styles.cardContent}>
                <Text style={styles.categoryText}>Categoría: {item.seat.category}</Text>
                <Text style={styles.seatText}>Asiento: {item.seat.row}-{item.seat.col}</Text>
                <Text style={styles.dateText}>Fecha de compra: {item.purchaseDate.toDate().toLocaleDateString()}</Text>
                {!item.cancelled && (
                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
                        <Text style={styles.cancelButtonText}>Cancelar Boleto</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Boletos</Text>
            {user && (
                <FlatList
                    data={tickets}
                    renderItem={renderTicket}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#842029',
        textAlign: 'center'
    },
    list: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderRadius: 5,
        marginBottom: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%',
    },
    posterImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginRight: 10,
    },
    cardContent: {
        flex: 1,
    },
    categoryText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    seatText: {
        fontSize: 14,
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
    },
    cancelButton: {
        backgroundColor: '#DC3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
