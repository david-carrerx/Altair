import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";

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
                            const ticketsData = querySnapshot.docs.map(doc => doc.data());
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

    const renderTicket = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.poster }} style={styles.posterImage} />
            <View style={styles.cardContent}>
                <Text style={styles.categoryText}>Categoría: {item.seat.category}</Text>
                <Text style={styles.seatText}>Asiento: {item.seat.row}-{item.seat.col}</Text>
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
        // Optional: Adjust width if needed
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
});
