'use strict';

module.exports = {
  async find(ctx) {
    return await strapi.query('testimonials').find(ctx.query);
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    return await strapi.query('testimonials').findOne({ id });
  },
};