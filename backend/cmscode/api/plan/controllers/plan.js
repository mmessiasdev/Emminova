// ./api/plan/controllers/plan.js

module.exports = {
  async create(ctx) {
    const { name, value } = ctx.request.body;

    // Criação do novo produto
    const newPlan = await strapi.services.plan.create({ name, value });

    // Criação do link de pagamento
    const paymentResponse = await strapi.services.plan.createPaymentLink(newPlan);

    // Retorne os dados do produto com o link de pagamento
    ctx.send({
      plan: newPlan,
      paymentLink: paymentResponse.paymentLink // Retorna o link de pagamento no map `paymentLink`
    });
  },
};
