import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';

function PaymentModal({ visible, onClose, onConfirm }) {
  const [cardDetails, setCardDetails] = useState();
  const { confirmPayment } = useConfirmPayment();

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      alert('Por favor completa los detalles de la tarjeta');
      return;
    }

    const billingDetails = { email: 'email@example.com' }; // Detalles de facturación

    try {
      // Llamar a tu servidor para crear un PaymentIntent
      const clientSecret = await fetchPaymentIntentClientSecret();

      // Confirmar el pago con los detalles de la tarjeta
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails,
        },
      });

      if (error) {
        alert(`Error de pago: ${error.message}`);
      } else if (paymentIntent) {
        alert('Pago exitoso!');
        onConfirm();
      }
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContent}>
        <Text style={styles.title}>Introduce los datos de tu tarjeta</Text>
        <CardField
          postalCodeEnabled={false}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={styles.card}
          style={styles.cardContainer}
          onCardChange={(cardDetails) => {
            setCardDetails(cardDetails);
          }}
        />
        <TouchableOpacity style={styles.payButton} onPress={handlePayPress}>
          <Text style={styles.payButtonText}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
  card: {
    backgroundColor: '#efefef',
  },
  payButton: {
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#DC3545',
  },
});

export default PaymentModal;
