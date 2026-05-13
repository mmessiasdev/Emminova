'use strict';


module.exports = {
    lifecycles: {
        async afterCreate(result, data) {
            try {
                // Cria o link de pagamento no Mercado Pago
                const paymentLink = await strapi.services.plan.createPaymentLink(result);

                // Atualiza o item com o link de pagamento
                await strapi.query('plan').update({ id: result.id }, { paymentLink });
            } catch (error) {
                strapi.log.error('Erro ao criar o link de pagamento', error);
            }
        },
    },
};