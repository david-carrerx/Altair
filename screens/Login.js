import React, { useState } from "react";
import { StyleSheet, View, Image, Dimensions, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import app from "../config/firebase";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const auth = getAuth(app);
const { width, height } = Dimensions.get('window');

export default function Login(props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const functionLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Iniciando sesión...", "Accediendo");
            props.navigation.navigate('Home');
        } catch (error) {
            Alert.alert("Error", "Usuario o contraseña incorrectos");
            console.log(error);
        }
    }

    const navigateToRegister = () => {
        props.navigation.navigate('Register');
    }

    const forgotPassword = () => {
        if (email) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    Alert.alert('Correo enviado', 'Se ha enviado un correo electrónico para restablecer la contraseña.');
                })
                .catch((error) => {
                    console.error(error);
                    Alert.alert('Error', 'Hubo un problema al intentar restablecer la contraseña.');
                });
        } else {
            Alert.alert('Ingrese su correo electrónico', 'Por favor ingrese su correo electrónico para restablecer la contraseña.');
        }
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
                <TextInput placeholder="Correo electrónico" style={styles.input} onChangeText={(text) => setEmail(text)} />
                <TextInput placeholder="Contraseña" style={styles.input} onChangeText={(text) => setPassword(text)} secureTextEntry />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={functionLogin}>
                        <Text style={styles.buttonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={navigateToRegister}>
                        <Text style={[styles.buttonText, styles.registerButtonText]}>Registrarse</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={forgotPassword}>
    <Text style={[styles.forgotPasswordText, { textDecorationLine: 'underline' }]}>
        ¿Olvidaste tu contraseña? Click aquí
    </Text>
</TouchableOpacity>
                <View style={styles.socialContainer}>
                    <Text style={styles.socialText}>Iniciar sesión con:</Text>
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
        height: height / 2,
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
        top: '50%',
        left: '50%',
        transform: [{ translateX: -(width / 3) }, { translateY: -(height / 4) }],
    },
    logo: {
        width: width / 1.4,
        height: height / 2,
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
    registerButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DC3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    registerButtonText: {
        color: '#DC3545',
        fontWeight: '500',
    },
    socialContainer: {
        alignItems: 'center',
    },
    socialText: {
        marginBottom: 1,
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
    },
    forgotPasswordText: {
        textAlign: 'center',
        color: '#DC3545',
        marginTop: -7,
        marginBottom: 10
    },
});
