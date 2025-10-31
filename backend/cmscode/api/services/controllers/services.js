'use strict';

module.exports = {
  async find(ctx) {
    return await strapi.query('services').find(ctx.query);
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    return await strapi.query('services').findOne({ id });
  },
};