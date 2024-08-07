import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Dimensions, TextInput, TouchableOpacity, Text, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import app from "../config/firebase";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithCredential, FacebookAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

const auth = getAuth(app);
const db = getFirestore(app);
const { width, height } = Dimensions.get('window');

export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        iosClientId: '646002099467-7m9bcr08uk8ik7t04f1q2j6lkjq6tl52.apps.googleusercontent.com',
        expoClientId: '646002099467-7m9bcr08uk8ik7t04f1q2j6lkjq6tl52.apps.googleusercontent.com',
    });

    const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
        clientId: '1113160256457215',
    });

    useEffect(() => {
        handleGoogleResponse();
    }, [googleResponse]);

    async function handleGoogleResponse() {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            if (authentication) {
                await signInWithGoogle(authentication.accessToken);
            }
        }
    }

    useEffect(() => {
        handleFacebookResponse();
    }, [facebookResponse]);

    async function handleFacebookResponse() {
        if (facebookResponse?.type === 'success' && facebookResponse.authentication) {
            const { accessToken } = facebookResponse.authentication;
            const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,picture.type(large)`);
            const userInfo = await userInfoResponse.json();
            setUserInfo(userInfo);
            const credential = FacebookAuthProvider.credential(accessToken);
            signInWithCredential(auth, credential)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const userData = {
                        fullName: user.displayName,
                        email: user.email,
                        role: 'user',
                    };
                    await setDoc(doc(db, "users", user.uid), userData);
                    console.log("Usuario autenticado con éxito. Rol:", userData.role); // Imprime el rol del usuario en la consola
                    Alert.alert("Iniciando sesión...", "Accediendo");
                    navigation.navigate('Home');
                })
                .catch(error => {
                    Alert.alert("Error", "Error al autenticar con Facebook");
                    console.log("Error al autenticar con Facebook:", error);
                });
        }
    }

    const signInWithGoogle = async (accessToken) => {
        const credential = GoogleAuthProvider.credential(null, accessToken);
        try {
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            const userData = {
                fullName: user.displayName,
                email: user.email,
                role: 'user',
            };
            await setDoc(doc(db, "users", user.uid), userData);
            console.log("Usuario autenticado con éxito. Rol:", userData.role); // Imprime el rol del usuario en la consola
            Alert.alert("Iniciando sesión...", "Accediendo");
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert("Error", "Error al autenticar con Google");
            console.log("Error al autenticar con Google:", error);
        }
    };

    const functionLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Iniciando sesión...", "Accediendo");
            navigation.navigate('Home');
        } catch (error) {
            Alert.alert("Error", "Usuario o contraseña incorrectos");
            console.log(error);
        }
    }

    const navigateToRegister = () => {
        navigation.navigate('Register');
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            <TouchableOpacity style={[styles.socialButton, styles.socialButtonMarginRight]} onPress={() => facebookPromptAsync()}>
                                <Image source={require('../assets/facebook-icon.png')} style={styles.socialIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, styles.socialButtonMarginLeft]} onPress={() => googlePromptAsync()}>
                                <Image source={require('../assets/google-icon.png')} style={styles.socialIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
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
        marginBottom: 0
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
        fontWeight: 'medium'
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
        marginBottom: 5,
        textAlign: 'center',
        color: '#DC3545',
        fontWeight: 'bold'
    },
});
