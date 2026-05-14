'use strict';

const { sanitizeEntity } = require('strapi-utils');

const MANAGEMENT_PERMISSIONS = new Set(['owner', 'dono', 'admin']);
const ALLOWED_PERMISSIONS = new Set(['owner', 'admin', 'collaborator']);

const toEnterpriseId = (entity) => {
    if (!entity) return null;
    const raw = entity.enterprise || entity.enterprise;
    return raw && typeof raw === 'object' ? raw.id : raw;
};

const toFatherId = (entity) => {
    if (!entity) return null;
    const raw = entity.father || entity.father;
    return raw && typeof raw === 'object' ? raw.id : raw;
};

const resolveAccessibleEnterprise = (entity) => {
    if (!entity) return null;
    if (entity.enterprise) return entity.enterprise;
    if (entity.father && entity.father.enterprise) return entity.father.enterprise;
    return null;
};

const withResolvedEnterprise = (entity) => {
    if (!entity) return entity;
    const sanitized = sanitizeEntity(entity, { model: strapi.models.profile });
    sanitized.enterprise = resolveAccessibleEnterprise(entity);
    return sanitized;
};

const getAccessibleEnterpriseId = (entity) => {
    const enterprise = resolveAccessibleEnterprise(entity);
    return toEnterpriseId({ enterprise });
};

const normalizePermission = (permission) => {
    if (!permission || typeof permission !== 'string') return 'collaborator';
    const normalized = permission.trim().toLowerCase();
    if (normalized === 'dono') return 'owner';
    if (normalized === 'colaborador') return 'collaborator';
    return normalized;
};

const getCurrentProfile = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return null;
    return strapi.services.profile.findOne({ user: user.id }, ['enterprise', 'father', 'father.enterprise']);
};

const hasManagementAccess = (profile) => {
    const normalized = normalizePermission(profile?.permission);
    return MANAGEMENT_PERMISSIONS.has(normalized);
};

const isOwnerProfile = (profile) => normalizePermission(profile?.permission) === 'owner';

const canBeOwnerProfile = (profile) => {
    if (!profile) return false;
    return !toFatherId(profile) && !!toEnterpriseId(profile);
};

const belongsToManagerScope = (managerProfile, targetProfile) => {
    if (!managerProfile || !targetProfile) return false;
    return String(targetProfile.id) === String(managerProfile.id) || String(toFatherId(targetProfile)) === String(managerProfile.id);
};

const buildTrialWindow = () => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);
    return {
        start: now.toISOString(),
        end: expiresAt.toISOString(),
    };
};

module.exports = {
    async find(ctx) {
        const currentProfile = await getCurrentProfile(ctx);
        if (!currentProfile) return ctx.unauthorized('Usuario nao autenticado');

        const enterpriseId = getAccessibleEnterpriseId(currentProfile);
        if (!enterpriseId) return ctx.forbidden('Usuario sem enterprise vinculada');

        const query = { ...ctx.query };
        delete query.enterprise;

        let dependents = [];
        if (query._q) {
            dependents = await strapi.services.profile.search({ ...query, father: currentProfile.id });
            dependents = dependents.filter((entity) => String(toFatherId(entity)) === String(currentProfile.id));
        } else {
            dependents = await strapi.services.profile.find({ ...query, father: currentProfile.id });
        }

        const entities = [currentProfile, ...dependents];

        return entities.map((entity) => sanitizeEntity(entity, { model: strapi.models.profile }));
    },

    async findMe(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.badRequest(null, [{ messages: [{ id: "Sem autorização. Header não encontrado." }] }]);
        }

        // Encontra o perfil pelo ID do usuário com relações populadas
        let entity = await strapi.services.profile.findOne({ user: user.id }, ['plan', 'father', 'father.plan', 'father.enterprise', 'father.user', 'user', 'curriculum', 'curriculum.certificates_files', 'enterprise']);

        if (!entity) {
            return ctx.notFound('Profile not found');
        }

        const now = new Date();
        let parentExpired = false;

        // Lógica Lazy de Expiração e Restauração
        if (!entity.father) {
            // Caso 1: Usuário Titular (não tem pai)
            if (entity.plan && entity.subscription_end_date && new Date(entity.subscription_end_date) < now) {
                strapi.log.info(`[lazy-check] Assinatura do titular ${entity.id} expirou. Removendo plano (set null).`);
                entity = await strapi.services.profile.update({ id: entity.id }, { plan: null });
            }
        } else {
            // Caso 2: Usuário Dependente (tem pai)
            const father = entity.father;

            // Verifica se o pai está ativo (tem plano e não expirou)
            const fatherActive = father.plan && (!father.subscription_end_date || new Date(father.subscription_end_date) >= now);

            if (fatherActive) {
                // Se o pai renovou ou está ativo:
                // Verificamos se o dependente está sem plano ou com plano errado, e restauramos para o ID 7 (dependentplan)
                const currentPlanId = entity.plan ? (entity.plan.id || entity.plan) : null;
                if (currentPlanId !== process.env.DEPENDENT_PLAN_ID) {
                    strapi.log.info(`[lazy-check] Titular pai ${father.id} está ativo. Restaurando plano do dependente ${entity.id}.`);
                    entity = await strapi.services.profile.update({ id: entity.id }, { plan: process.env.DEPENDENT_PLAN_ID });
                }
            } else {
                // Se o pai está expirado ou sem plano, o dependente perde o acesso (plano vira Free)
                const freePlanId = Number(process.env.FREE_PLAN_ID) || 1;
                if (entity.plan && entity.plan.id !== freePlanId) {
                    strapi.log.info(`[lazy-check] Titular pai ${father.id} expirou. Setando dependente ${entity.id} como Free.`);
                    entity = await strapi.services.profile.update({ id: entity.id }, { plan: freePlanId });
                }
                parentExpired = true;
            }
        }

        // Retorna o perfil sanitizado com a flag customizada para o App exibir o alerta
        return {
            ...withResolvedEnterprise(entity),
            parent_expired: parentExpired
        };
    },

    async unlinkMe(ctx) {
        try {
            const user = ctx.state.user;
            if (!user) {
                strapi.log.error('[unlink] Usuário não encontrado no state.');
                return ctx.badRequest('Sem autorização');
            }

            strapi.log.info(`[unlink] Tentando desvincular usuário ID: ${user.id}`);

            // Popula o pai para garantir que a verificação funcione
            const profile = await strapi.services.profile.findOne({ user: user.id }, ['father']);
            if (!profile) {
                strapi.log.error(`[unlink] Perfil não encontrado para o usuário ${user.id}`);
                return ctx.notFound('Perfil não encontrado');
            }

            if (!profile.father) {
                strapi.log.warn(`[unlink] Perfil ${profile.id} tentou desvincular mas não possui 'father'.`);
                return ctx.badRequest('Este perfil não é um dependente');
            }

            // Desvincular: remove a relação com o pai e define o plano como Free
            const freePlanId = Number(process.env.FREE_PLAN_ID) || 1;
            strapi.log.info(`[unlink] Executando update para perfil ${profile.id}. Removendo father e setando plan: ${freePlanId}.`);
            const updated = await strapi.services.profile.update(
                { id: profile.id },
                {
                    father: null,
                    plan: freePlanId
                }
            );

            strapi.log.info(`[unlink] Sucesso! Dependente ${profile.id} se desvinculou do pai.`);

            return sanitizeEntity(updated, { model: strapi.models.profile });
        } catch (err) {
            strapi.log.error(`[unlink] Erro crítico: ${err.message}`);
            strapi.log.error(err);
            return ctx.badRequest(`Erro interno: ${err.message}`);
        }
    },

    async create(ctx) {
        const currentProfile = await getCurrentProfile(ctx);
        if (!currentProfile) return ctx.unauthorized('Usuario nao autenticado');
        if (!hasManagementAccess(currentProfile)) {
            return ctx.forbidden('Apenas owner/admin podem criar profiles');
        }

        const enterpriseId = getAccessibleEnterpriseId(currentProfile);
        if (!enterpriseId) return ctx.forbidden('Usuario sem enterprise vinculada');

        const body = { ...(ctx.request.body || {}) };
        
        if (body.email && body.password) {
            const existingUser = await strapi.plugins['users-permissions'].services.user.fetch({ email: body.email });
            if (existingUser) {
                return ctx.badRequest(null, [{ messages: [{ id: 'Um usuário com este e-mail já existe.' }] }]);
            }
            
            const role = await strapi.query('role', 'users-permissions').findOne({ type: 'authenticated' }, []);
            
            try {
                const newUser = await strapi.plugins['users-permissions'].services.user.add({
                    username: body.email,
                    email: body.email,
                    password: body.password,
                    provider: 'local',
                    role: role ? role.id : null,
                    confirmed: true
                });
                body.user = newUser.id;
            } catch (err) {
                strapi.log.error('Erro ao criar usuário:', err);
                return ctx.badRequest(null, [{ messages: [{ id: 'Erro ao criar conta de usuário.' }] }]);
            }
        }
        
        delete body.password;
        body.father = currentProfile.id;
        delete body.enterprise;
        body.permission = normalizePermission(body.permission);
        if (!ALLOWED_PERMISSIONS.has(body.permission)) body.permission = 'collaborator';
        if (body.permission === 'owner') {
            return ctx.forbidden('A permissao owner e exclusiva do profile principal vinculado a enterprise');
        }

        const entity = await strapi.services.profile.create(body);
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },

    async update(ctx) {
        const currentProfile = await getCurrentProfile(ctx);
        if (!currentProfile) return ctx.unauthorized('Usuario nao autenticado');
        if (!hasManagementAccess(currentProfile)) {
            return ctx.forbidden('Apenas owner/admin podem editar profiles');
        }

        const enterpriseId = getAccessibleEnterpriseId(currentProfile);
        if (!enterpriseId) return ctx.forbidden('Usuario sem enterprise vinculada');

        const { id } = ctx.params;
        const existing = await strapi.services.profile.findOne({ id }, ['enterprise', 'father', 'father.enterprise', 'user']);
        if (!existing) return ctx.notFound('Profile not found');

        if (!belongsToManagerScope(currentProfile, existing)) {
            return ctx.forbidden('Acesso negado para este profile');
        }

        const body = { ...(ctx.request.body || {}) };
        delete body.enterprise;
        if (String(existing.id) !== String(currentProfile.id)) {
            body.father = toFatherId(existing) || currentProfile.id;
        }
        if (Object.prototype.hasOwnProperty.call(body, 'permission')) {
            body.permission = normalizePermission(body.permission);
            if (!ALLOWED_PERMISSIONS.has(body.permission)) body.permission = 'collaborator';
            if (body.permission === 'owner') {
                if (!canBeOwnerProfile(existing)) {
                    return ctx.forbidden('A permissao owner e exclusiva do profile principal vinculado a enterprise');
                }

                if (!isOwnerProfile(existing)) {
                    return ctx.forbidden('Nao e permitido promover outro usuario para owner');
                }
            }
        }

        const entity = await strapi.services.profile.update({ id }, body);

        if (existing.user && (body.email || body.password)) {
            const userUpdateData = {};
            if (body.email) userUpdateData.email = body.email;
            if (body.password) userUpdateData.password = body.password;
            
            try {
                await strapi.plugins['users-permissions'].services.user.edit({ id: existing.user.id }, userUpdateData);
            } catch (err) {
                strapi.log.error(`Erro ao atualizar o user do profile ${id}:`, err);
            }
        }

        return sanitizeEntity(entity, { model: strapi.models.profile });
    },

    async delete(ctx) {
        const currentProfile = await getCurrentProfile(ctx);
        if (!currentProfile) return ctx.unauthorized('Usuario nao autenticado');
        if (!hasManagementAccess(currentProfile)) {
            return ctx.forbidden('Apenas owner/admin podem excluir profiles');
        }

        const enterpriseId = getAccessibleEnterpriseId(currentProfile);
        if (!enterpriseId) return ctx.forbidden('Usuario sem enterprise vinculada');

        const { id } = ctx.params;
        const existing = await strapi.services.profile.findOne({ id }, ['enterprise', 'father', 'father.enterprise', 'user']);
        if (!existing) return ctx.notFound('Profile not found');

        if (!belongsToManagerScope(currentProfile, existing)) {
            return ctx.forbidden('Acesso negado para este profile');
        }

        const entity = await strapi.services.profile.delete({ id });
        
        if (existing.user) {
            try {
                await strapi.plugins['users-permissions'].services.user.remove({ id: existing.user.id });
            } catch (err) {
                strapi.log.error(`Erro ao deletar o user associado ao profile ${id}:`, err);
            }
        }
        
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },

    async createMe(ctx) {
        try {
            const user = ctx.state.user;

            if (!user) {
                return ctx.badRequest(null, [{ messages: [{ id: 'Sem autorizacao. Usuario nao encontrado.' }] }]);
            }

            const existing = await strapi.services.profile.findOne({ user: user.id });
            if (existing) {
                return withResolvedEnterprise(existing);
            }

            const requestedFatherId = ctx.request.body.father || null;
            let fatherProfile = null;
            const requestedEnterpriseId = ctx.request.body.enterprise || ctx.request.body.enterprise || null;

            if (requestedFatherId) {
                fatherProfile = await strapi.services.profile.findOne(
                    { id: requestedFatherId },
                    ['enterprise', 'father', 'father.enterprise']
                );

                if (!fatherProfile) {
                    return ctx.badRequest(null, [{ messages: [{ id: 'Profile pai nao encontrado.' }] }]);
                }
            }

            const trialWindow = buildTrialWindow();
            const initialPlanId = Number(process.env.START_PLAN_ID) || 1;
            const isPrincipalProfile = !fatherProfile && !!requestedEnterpriseId;

            const result = await strapi.services.profile.create({
                fullname: ctx.request.body.fullname,
                email: user.email,
                sector: ctx.request.body.sector,
                personid: ctx.request.body.personid,
                father: fatherProfile ? fatherProfile.id : null,
                enterprise: fatherProfile ? null : requestedEnterpriseId,
                permission: isPrincipalProfile ? 'owner' : 'collaborator',
                plan: isPrincipalProfile ? initialPlanId : null,
                plan_expiration: isPrincipalProfile ? trialWindow.end : null,
                user: user.id,
            });

            const completeResult = await strapi.services.profile.findOne(
                { id: result.id },
                ['enterprise', 'father', 'father.enterprise', 'user']
            );

            return withResolvedEnterprise(completeResult);
        } catch (err) {
            return ctx.badRequest(null, [{ messages: [{ id: err.message }] }]);
        }
    },

};
