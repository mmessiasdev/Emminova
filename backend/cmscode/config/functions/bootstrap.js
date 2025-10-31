module.exports = async () => {

  const countSteps = await strapi.query('steps').count();
  if (countSteps === 0) {
    await strapi.query('steps').create({ step_number:1, title:'Link para o protótipo navegável do Wireframe', description:'Esqueleto de cada página' });
    await strapi.query('steps').create({ step_number:2, title:'Concepção Criativa da Home e página interna', description:'Layout editável' });
    await strapi.query('steps').create({ step_number:3, title:'Criação das demais telas do projeto', description:'Arquivo aberto/editável' });
    await strapi.query('steps').create({ step_number:4, title:'Início da Programação Front-end e Back-end', description:'Implementação' });
  }

  const countProjects = await strapi.query('projects').count();
  if (countProjects === 0) {
    await strapi.query('projects').create({ title:'NDR', description:'Solução de monitoramento e resposta.', order:1 });
    await strapi.query('projects').create({ title:'FS Fashion', description:'E-commerce e catálogo com integração.', order:2 });
    await strapi.query('projects').create({ title:'Freedom', description:'Plataforma de pagamentos e assinaturas.', order:3 });
  }

  const countServices = await strapi.query('services').count();
  if (countServices === 0) {
    await strapi.query('services').create({ title:'Desenvolvimento de Sites • Páginas', description:'Sites otimizados e responsivos.', order:1 });
    await strapi.query('services').create({ title:'Desenvolvimento de Web • Apps', description:'Aplicações web sob medida.', order:2 });
    await strapi.query('services').create({ title:'Desenvolvimento de Sistemas', description:'Soluções completas de software.', order:3 });
  }

  const countTestimonials = await strapi.query('testimonials').count();
  if (countTestimonials === 0) {
    await strapi.query('testimonials').create({ name:'M. Mendes', company:'Cliente', comment:'Excelente parceria e execução impecável.', rating:5 });
    await strapi.query('testimonials').create({ name:'H. Natalin', company:'Cliente', comment:'Entregaram rápido e com alta qualidade!', rating:5 });
    await strapi.query('testimonials').create({ name:'A. Macedo', company:'Cliente', comment:'Equipe madura e muito atenciosa.', rating:5 });
  }
};
