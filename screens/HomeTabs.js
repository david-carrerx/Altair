
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, View } from 'react-native';
import TicketsIcon from '../assets/ticket.png'; // Importa el ícono para Tickets
import ProfileIcon from '../assets/user-icon.png';
import EventsIcon from '../assets/event-icon.png';

import Tickets from './Tickets'; // Importa Tickets en lugar de Profile
import Profile from './Profile'; // Importa Profile
import EventsStack from './EventsStack'; // Importa EventsStack en lugar de Events

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
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
                        fontWeight: 'bold'
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
