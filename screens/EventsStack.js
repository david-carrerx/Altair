import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Events from './Events';
import AddEvent from './AddEvent';

const Stack = createStackNavigator();

export default function EventsStack() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="AddEvent" component={AddEvent} />
        </Stack.Navigator>
    );
}
