// ./api/plan/services/plan.js
const mercadopago = require('mercadopago');

const client = new mercadopago.MercadoPagoConfig({
  accessToken: 'TEST-2869162016512406-102909-e3a08dc42979eadc840e775ebf8c7a28-1983614734'
});

module.exports = {
  async createPaymentLink(plan) {
    try {
      const { name, value } = plan;

      const payment = new mercadopago.Payment(client);

      const body = {
        transaction_amount: value,
        description: name,
        payment_method_id: 'pix',
        payer: {
          email: 'mmessiasdev@gmail.com'
        }
      };

      const response = await payment.create({ body });
      return { paymentLink: response.body.init_point }; // Retorna o link de pagamento no map `paymentLink`
    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error);
      throw new Error("Falha ao criar o link de pagamento.");
    }
  }
};
