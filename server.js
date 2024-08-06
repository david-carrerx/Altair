const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51PkXTDRtfvpVyOV0ta6h2ePqm5hNpNl4z1FTlgo56clwPoV5Gj9M7e2hPcYmjn1dgnxNEKmCO46Qme1tDS4BmxMi00w50nCbXF');

app.use(express.json()); // Asegúrate de incluir esto para que req.body funcione

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // Obtén el monto desde el cuerpo de la solicitud

    // Crea el PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    // Envía el clientSecret al cliente
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    // Envía un mensaje de error en caso de fallo
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
