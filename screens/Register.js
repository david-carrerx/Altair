import React, { useState } from "react";
import { StyleSheet, View, Image, Dimensions, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import app from "../config/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const { width, height } = Dimensions.get('window');

export default function Register(props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const register = async () => {
        if (!email || !password || !confirmPassword || !fullName) {
            Alert.alert("Error", "Por favor, completa todos los campos.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert("Error", "El correo electrónico ingresado no es válido");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user; // Obteniendo el usuario de la credencial
            const userData = {
                fullName: fullName,
                email: email,
                role: 'user'
            };

            // Utilizando el mismo ID de autenticación como ID del documento en Firestore
            const docRef = await setDoc(doc(db, "users", user.uid), userData);

            Alert.alert("Usuario creado exitosamente");
            props.navigation.navigate('Login');
        } catch (error) {
            Alert.alert("Error", "Hubo un error al crear la cuenta");
            console.log(error);
        }
    }

    const goToLogin = () => {
        props.navigation.navigate('Login');
    }
    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={require('../assets/login-wallpaper.jpeg')} style={styles.image} />
                <View style={styles.overlay}></View>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/altair-logo.png')} style={styles.logo} />
                </View>
            </View>
            <View style={styles.contentContainer}>
                <TextInput placeholder="Nombre completo" style={styles.input} onChangeText={(text)=>setFullName(text)}/>
                <TextInput placeholder="Correo electrónico" style={styles.input} onChangeText={(text)=>setEmail(text)}/>
                <TextInput placeholder="Contraseña" style={styles.input} onChangeText={(text)=>setPassword(text)} secureTextEntry/>
                <TextInput placeholder="Confirmar Contraseña" style={styles.input} onChangeText={(text)=>setConfirmPassword(text)} secureTextEntry/>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={register}>
                        <Text style={styles.buttonText}>Registrarse</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={goToLogin}>
                        <Text style={[styles.buttonText, styles.loginButtonText]}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.socialContainer}>
                    <Text style={styles.socialText}>También puedes registrarte con:</Text>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={[styles.socialButton, styles.socialButtonMarginRight]}>
                            <Image source={require('../assets/facebook-icon.png')} style={styles.socialIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.socialButton, styles.socialButtonMarginLeft]}>
                            <Image source={require('../assets/google-icon.png')} style={styles.socialIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        width: width,
        height: height / 3,
        position: 'relative', 
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(44, 11, 14, 0.8)', 
    },
    logoContainer: {
        position: 'absolute',
        top: '25%', 
        left: '50%',
        transform: [{ translateX: -(width / 4) }], 
    },
    logo: {
        width: width / 2, 
        height: height / 5, 
        resizeMode: 'contain',
        tintColor: '#fff', 
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#DC3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    loginButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DC3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500', 
    },
    loginButtonText: {
        color: '#DC3545',
        fontWeight: '500', 
    },
    socialContainer: {
        alignItems: 'center',
    },
    socialText: {
        marginBottom: 10,
        color: '#DC3545',
        fontWeight: 'bold'
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '50%',
    },
    socialButton: {
        padding: 1,
    },
    socialButtonMarginRight: {
        marginRight: 0, 
    },
    socialButtonMarginLeft: {
        marginLeft: 0,
    },
    socialIcon: {
        width: 40,
        height: 40,
    }
});
