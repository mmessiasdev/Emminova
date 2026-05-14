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
  async findPublic(ctx) {
    const { id } = ctx.params;
    
    // Find project ensuring it is public, and populate everything needed for the docs
    const project = await strapi.services.project.findOne(
      { id, is_public: true },
      ['enterprise', 'enterprise.logo', 'topics', 'topics.subtopics', 'topics.subtopics.contents']
    );

    if (!project) {
      return ctx.notFound('Projeto não encontrado ou não é público');
    }

    return sanitizeEntity(project, { model: strapi.models.project });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    
    // Find project and all nested content
    const project = await strapi.services.project.findOne({ id }, ['topics', 'topics.subtopics', 'topics.subtopics.contents']);
    
    if (!project) {
        return ctx.notFound('Projeto não encontrado');
    }

    // Collect all files and entities to delete
    const allFiles = [];
    const contentIds = [];
    const subtopicIds = [];
    const topicIds = [];

    if (project.topics) {
        for (const t of project.topics) {
            topicIds.push(t.id);
            if (t.subtopics) {
                for (const st of t.subtopics) {
                    subtopicIds.push(st.id);
                    if (st.contents) {
                        for (const c of st.contents) {
                            contentIds.push(c.id);
                            const files = extractUploadFilenames(c.body);
                            allFiles.push(...files);
                        }
                    }
                }
            }
        }
    }

    // 1. Delete associated files
    if (allFiles.length > 0) {
        await deleteFilesByUrls(allFiles);
    }

    // 2. Cascade delete contents
    for (const cid of contentIds) {
        await strapi.services.content.delete({ id: cid });
    }

    // 3. Cascade delete subtopics
    for (const stid of subtopicIds) {
        await strapi.services.subtopic.delete({ id: stid });
    }

    // 4. Cascade delete topics
    for (const tid of topicIds) {
        await strapi.services.topic.delete({ id: tid });
    }

    // 5. Delete the project itself
    const entity = await strapi.services.project.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.project });
  }
};
