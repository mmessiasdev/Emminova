const crypto = require('crypto');

module.exports = {
  async generateResetCode(email) {
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await strapi.query('user', 'users-permissions').update(
      { email },
      {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiresAt
      }
    );

    return resetCode;
  },

  async validateResetCode(email, code) {
    const user = await strapi.query('user', 'users-permissions').findOne({
      email: email,
      resetPasswordToken: code,
      resetPasswordExpires_gt: new Date()
    });

    if (!user) {
      throw new Error('Código inválido ou expirado. Solicite um novo código.');
    }

    // Verificação adicional (opcional, mas já garantida pelo findOne)
    if (user.resetPasswordToken !== code) {
      throw new Error('Código de verificação incorreto');
    }

    return user;
  }
};
