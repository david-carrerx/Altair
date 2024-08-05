import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeTabs from './screens/HomeTabs';
import Login from './screens/Login';
import Register from './screens/Register';
import AddEvent from './screens/AddEvent';
import { StripeProvider } from '@stripe/stripe-react-native';


const Stack = createStackNavigator();

export default function App() {
    return (
        <StripeProvider publishableKey="pk_test_51PkXTDRtfvpVyOV0OYyWGz5sVVlr2PUVeEb1uNAUIvetMcbcdw9F703o7KoiTNT1xaSw6N5sgHJCcf6ZRdeDPYix00uzdaId1O">
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name='Login' component={Login} />
                <Stack.Screen name='Register' component={Register} />
                <Stack.Screen name='Home' component={HomeTabs} options={{ headerShown: false }} />
                <Stack.Screen name="AddEvent" component={AddEvent} />
            </Stack.Navigator>
        </NavigationContainer>
        </StripeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
