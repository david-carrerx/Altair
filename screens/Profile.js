import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert } from 'react-native';
import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Profile({ navigation }) {
    const auth = getAuth();
    const db = getFirestore();
    const [user, setUser] = useState(null);
    const defaultProfileImage = require('../assets/default-profile-image.png');

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

    const handleLogout = () => {
        navigation.navigate('Login');
    };

    const changePassword =  () => {
        sendPasswordResetEmail(auth, user.email)
            .then(() => {
                Alert.alert('Se ha enviado un correo electrónico para restablecer la contraseña');
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Hubo un problema al intentar restablecer la contraseña');
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                {user && (
                    <>
                        <Image
                            source={user.photoURL ? { uri: user.photoURL } : defaultProfileImage}
                            style={styles.profileImage}
                        />
                        <Text style={styles.userName}>{user.fullName}</Text>
                        <Text style={styles.userRole}>{user.role}</Text>
                        <TextInput placeholder="Correo electrónico" style={styles.input} value={user.email} editable={false}/>
                        <TouchableOpacity style={[styles.button, { backgroundColor: '#B02A37' }]} onPress={changePassword}>
                            <Text style={styles.buttonText}>Cambiar contraseña</Text>
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    userName: {
        marginTop: 10,
        color: '#842029',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userRole: {
        marginTop: 5,
        marginBottom: 10,
        color: '#DC3545',
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        width: 200,
        color: '#000',
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
