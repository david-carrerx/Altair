import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, View, Text, Modal, StyleSheet } from 'react-native';
import TicketsIcon from '../assets/ticket.png';
import ProfileIcon from '../assets/user-icon.png';
import EventsIcon from '../assets/event-icon.png';
import NotificationsIcon from '../assets/notifications-icon.png';
import TrashIcon from '../assets/trash-icon.png';  // Asegúrate de tener un ícono de basura en tus assets
import Tickets from './Tickets';
import Profile from './Profile';
import EventsStack from './EventsStack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
    const auth = getAuth();
    const db = getFirestore();
    const [user, setUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            if (userAuth) {
                const docRef = doc(db, 'users', userAuth.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('Document data:', docSnap.data()); // Este es el log importante
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
    
    

    const openModal = () => {
        if (user && user.alerts) {
            console.log('User Alerts:', user.alerts);
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleDeleteAlert = async (alertToDelete) => {
        if (user) {
            try {
                const updatedAlerts = user.alerts.filter((alert) => alert !== alertToDelete);
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userDocRef, { alerts: updatedAlerts });
                setUser((prevUser) => ({
                    ...prevUser,
                    alerts: updatedAlerts,
                }));
            } catch (error) {
                console.error('Error deleting alert: ', error);
            }
        }
    };

    const getRoleFromUser = () => {
        if (user && user.role) {
            return user.role.toLowerCase();
        }
        return 'user';
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
                    headerRight: () => (
                        <TouchableOpacity onPress={openModal} style={styles.notificationContainer}>
                            <Image source={NotificationsIcon} style={{ width: 30, height: 30 }} />
                            {user && user.alerts && user.alerts.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{user.alerts.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ),
                })}
                tabBar={(props) => (
                    <View style={{ flexDirection: 'row', height: 50 }}>
                        {props.state.routes.map((route, index) => {
                            const isFocused = props.state.index === index;
                            let color = isFocused ? (route.name === 'Profile' || route.name === 'Tickets' ? '#842029' : '#B02A37') : '#B02A37';

                            if (route.name === 'EventsStack' && isFocused) {
                                color = '#842029';
                            }

                            if (route.name === 'Tickets' && getRoleFromUser() === 'admin') {
                                return null;
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Notificaciones</Text>
                        {user && user.alerts && user.alerts.length > 0 ? (
                            user.alerts.map((alert, index) => (
                                <View key={index} style={styles.alertContainer}>
                                    <Text style={styles.modalText}>{alert}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteAlert(alert)}>
                                        <Image source={TrashIcon} style={{ width: 20, height: 20 }} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.modalText}>No tienes notificaciones</Text>
                        )}
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    notificationContainer: {
        marginRight: 10,
    },
    badge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        padding: 5,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 5,
        flex: 1,
    },
    alertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#B02A37',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
