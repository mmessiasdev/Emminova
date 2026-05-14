'use strict';

const { sanitizeEntity } = require('strapi-utils');

const extractUploadFilenames = (body) => {
    if (!body) return [];
    const regex = /\/uploads\/([^\s)"']+)/g;
    const urls = [];
    let match;
    while ((match = regex.exec(body)) !== null) {
        urls.push('/uploads/' + match[1]); 
    }
    return urls;
};

const deleteFilesByUrls = async (urls) => {
    for (const url of urls) {
        try {
            // Find file by URL
            const files = await strapi.query('file', 'upload').find({ url });
            if (files && files.length > 0) {
                await strapi.plugins.upload.services.upload.remove(files[0]);
                strapi.log.info(`Deleted file: ${url}`);
            }
        } catch (err) {
            strapi.log.error(`Error deleting file ${url}:`, err);
        }
    }
};

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const existing = await strapi.services.content.findOne({ id });
    
    // Perform standard update
    let entity;
    if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);
        entity = await strapi.services.content.update({ id }, data, { files });
    } else {
        entity = await strapi.services.content.update({ id }, ctx.request.body);
    }
    
    // Check if body was modified and find removed files
    const newBody = ctx.request.body.body || (entity && entity.body);
    if (existing && existing.body && newBody !== undefined) {
        const oldFiles = extractUploadFilenames(existing.body);
        const newFiles = extractUploadFilenames(newBody);
        
        const removedFiles = oldFiles.filter(f => !newFiles.includes(f));
        if (removedFiles.length > 0) {
            await deleteFilesByUrls(removedFiles);
        }
    }
    
    return sanitizeEntity(entity, { model: strapi.models.content });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const existing = await strapi.services.content.findOne({ id });
    
    if (existing && existing.body) {
        const filesToRemove = extractUploadFilenames(existing.body);
        if (filesToRemove.length > 0) {
            await deleteFilesByUrls(filesToRemove);
        }
    }
    
    const entity = await strapi.services.content.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.content });
  }
};
