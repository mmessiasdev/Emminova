'use strict';

module.exports = {
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    const user = await strapi.query('user', 'users-permissions').findOne({ email });
    if (!user) return ctx.send({ ok: true }); // Não revela se o email existe

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await strapi.query('user', 'users-permissions').update(
      { id: user.id },
      {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expiresAt
      }
    );

    try {
      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: 'Seu código de recuperação',
        html: `<p>Seu código é: <strong>${resetCode}</strong></p>`
      });
      return ctx.send({ ok: true });
    } catch (err) {
      return ctx.badRequest(null, 'Erro ao enviar email');
    }
  },

  async validateResetCode(ctx) {
    const { email, code } = ctx.request.body;

    try {
      const user = await strapi.query('user', 'users-permissions').findOne({
        email,
        resetPasswordToken: code,
        resetPasswordExpires_gt: new Date()
      });

      if (!user) {
        return ctx.send({ valid: false, message: 'Código inválido ou expirado' }, 400);
      }

      return ctx.send({ valid: true, message: 'Código válido' });
    } catch (err) {
      return ctx.send({ valid: false, message: 'Erro na validação' }, 500);
    }
  },

  async resetPassword(ctx) {
    const { email, code, password } = ctx.request.body;

    const user = await strapi.query('user', 'users-permissions').findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires_gt: new Date()
    });

    if (!user) {
      return ctx.badRequest(null, 'Código inválido ou expirado');
    }

    try {
      await strapi.plugins['users-permissions'].services.user.edit(
        { id: user.id },
        {
          password: password,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      );

      return ctx.send({ ok: true });
    } catch (err) {
      return ctx.badRequest(null, 'Erro ao atualizar senha');
    }
  },

  async changePassword(ctx) {
    const { currentPassword, newPassword } = ctx.request.body;
    const { id } = ctx.state.user; // Usuário autenticado

    if (!currentPassword || !newPassword) {
      return ctx.badRequest("Senha atual e nova senha são obrigatórias");
    }

    const user = await strapi.query('user', 'users-permissions').findOne({ id });

    // Verifica senha atual
    const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(
      currentPassword,
      user.password
    );

    if (!validPassword) {
      return ctx.badRequest("Senha atual incorreta");
    }

    // Atualiza senha
    await strapi.plugins['users-permissions'].services.user.edit(
      { id },
      { password: newPassword }
    );

    return { message: "Senha alterada com sucesso" };
  }


};