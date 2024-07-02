import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Tickets({ navigation }) {
    const auth = getAuth();
    const db = getFirestore();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            if (userAuth) {
                const docRef = doc(db, "users", userAuth.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Tickets</Text>
            <View style={styles.profileContainer}>
                {user && (
                    <>
                        <Text style={styles.userRole}>{user.role}</Text>
                    </>
                )}
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    profileContainer: {
        alignItems: 'center',
    },
    userRole: {
        marginTop: 5,
        marginBottom: 10,
        color: '#DC3545',
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#DC3545',
        borderRadius: 5,
        padding: 10,
        width: 200,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});
