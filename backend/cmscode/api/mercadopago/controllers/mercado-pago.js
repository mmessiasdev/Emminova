require('dotenv').config();

'use strict';
const axios = require('axios');


module.exports = {
  async createCardToken(ctx) {
    try {
      const {
        card_number,
        expiration_month,
        expiration_year,
        security_code,
        cardholder
      } = ctx.request.body;

      // Chama a API do Mercado Pago para gerar o card token
      const response = await axios.post(
        'https://api.mercadopago.com/v1/card_tokens',
        {
          card_number,
          expiration_month,
          expiration_year,
          security_code,
          cardholder
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Retorna o card_token gerado pela API do Mercado Pago
      return ctx.send({ card_token: response.data.id });
    } catch (err) {
      // Exibe o erro completo no log para diagnóstico
      console.error("Erro ao gerar card_token:", err.response?.data || err);

      // Envia uma resposta com erro detalhado
      return ctx.badRequest('Erro ao gerar card_token.', err.response?.data || err);
    }
  }
};
