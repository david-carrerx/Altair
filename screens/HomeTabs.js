import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, View } from 'react-native';
import TicketsIcon from '../assets/ticket.png';
import ProfileIcon from '../assets/user-icon.png';
import EventsIcon from '../assets/event-icon.png';
import Tickets from './Tickets';
import Profile from './Profile';
import EventsStack from './EventsStack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
    const auth = getAuth();
    const db = getFirestore();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            if (userAuth) {
                const docRef = doc(db, 'users', userAuth.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    console.log('No such document!');
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Función para obtener el rol del usuario
    const getRoleFromUser = () => {
        if (user && user.role) {
            return user.role.toLowerCase(); // Suponiendo que el rol está en minúsculas
        }
        return 'user'; // Si no se encuentra el rol, se asume que es 'user'
    };

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused }) => {
                        let iconName;

                        if (route.name === 'Tickets') {
                            iconName = focused ? TicketsIcon : TicketsIcon;
                        } else if (route.name === 'Profile') {
                            iconName = focused ? ProfileIcon : ProfileIcon;
                        } else if (route.name === 'EventsStack') {
                            iconName = focused ? EventsIcon : EventsIcon;
                        }

                        return <Image source={iconName} style={{ width: 30, height: 30 }} />;
                    },
                    tabBarActiveTintColor: '#000',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: {
                        backgroundColor: '#B02A37',
                        height: 60,
                    },
                    tabBarShowLabel: false,
                    headerStyle: {
                        backgroundColor: '#B02A37',
                    },
                    headerTitleStyle: {
                        color: 'white',
                        fontFamily: 'Joti One',
                        fontWeight: 'bold',
                    },
                    headerTitleAllowFontScaling: false,
                    headerTitle: 'ALTAIR',
                })}
                tabBar={(props) => (
                    <View style={{ flexDirection: 'row', height: 50 }}>
                        {props.state.routes.map((route, index) => {
                            const isFocused = props.state.index === index;
                            let color = isFocused ? (route.name === 'Profile' || route.name === 'Tickets' ? '#842029' : '#B02A37') : '#B02A37';

                            if (route.name === 'EventsStack' && isFocused) {
                                color = '#842029';
                            }

                            // Ocultar la pestaña de "Tickets" si el rol del usuario es "user"
                            if (route.name === 'Tickets' && getRoleFromUser() === 'admin') {
                                return null; // Devuelve null para no renderizar la pestaña
                            }

                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    onPress={() => props.navigation.navigate(route.name)}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: color,
                                    }}
                                >
                                    {props.descriptors[route.key].options.tabBarIcon({ focused: isFocused })}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            >
                <Tab.Screen name="EventsStack" component={EventsStack} />
                <Tab.Screen name="Tickets" component={Tickets} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        </View>
    );
}
