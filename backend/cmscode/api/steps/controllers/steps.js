'use strict';

module.exports = {
  async find(ctx) {
    return await strapi.query('steps').find(ctx.query);
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    return await strapi.query('steps').findOne({ id });
  },
};