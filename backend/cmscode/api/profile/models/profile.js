'use strict';

const toId = (value) => {
    if (!value) return null;
    return typeof value === 'object' ? value.id || null : value;
};

const previousEnterpriseByProfileId = new Map();

const findPrincipalProfileId = async (enterpriseId, preferredProfileId = null) => {
    if (!enterpriseId) return null;

    if (preferredProfileId) {
        const preferred = await strapi.query('profile').findOne({ id: preferredProfileId }, ['enterprise', 'father']);
        if (preferred && !toId(preferred.father) && String(toId(preferred.enterprise)) === String(enterpriseId)) {
            return preferred.id;
        }
    }

    const profiles = await strapi.query('profile').find({ enterprise: enterpriseId, _limit: -1 }, ['father']);
    const principal = (profiles || []).find((profile) => !toId(profile.father));
    return principal ? principal.id : null;
};

const syncEnterpriseMainProfile = async ({ profileId = null, enterpriseId = null, previousEnterpriseId = null } = {}) => {
    const targets = [enterpriseId, previousEnterpriseId].filter(Boolean);

    for (const targetEnterpriseId of targets) {
        const enterprise = await strapi.query('enterprise').findOne({ id: targetEnterpriseId }, ['profile']);
        if (!enterprise) continue;

        const principalProfileId = await findPrincipalProfileId(targetEnterpriseId, profileId);
        const currentProfileId = toId(enterprise.profile);

        if (String(currentProfileId || '') === String(principalProfileId || '')) {
            continue;
        }

        await strapi.query('enterprise').update(
            { id: targetEnterpriseId },
            { profile: principalProfileId || null }
        );
    }
};

module.exports = {
    lifecycles: {
        async beforeUpdate(params) {
            const profileId = toId(params?.id);
            if (!profileId) return;

            const existing = await strapi.query('profile').findOne({ id: profileId }, ['enterprise']);
            previousEnterpriseByProfileId.set(String(profileId), toId(existing?.enterprise));
        },

        async afterCreate(result) {
            await syncEnterpriseMainProfile({
                profileId: result.id,
                enterpriseId: toId(result.enterprise),
            });
        },

        async afterUpdate(result) {
            const profileId = String(result.id);
            const previousEnterpriseId = previousEnterpriseByProfileId.get(profileId) || null;
            previousEnterpriseByProfileId.delete(profileId);

            await syncEnterpriseMainProfile({
                profileId: result.id,
                enterpriseId: toId(result.enterprise),
                previousEnterpriseId,
            });
        },

        async afterDelete(result) {
            await syncEnterpriseMainProfile({
                previousEnterpriseId: toId(result?.enterprise),
            });
        },
    },
};
