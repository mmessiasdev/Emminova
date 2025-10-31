// Configurações da aplicação
export const APP_CONFIG = {
  // Nome da aplicação
  name: import.meta.env.VITE_APP_NAME || 'Curso IA',
  
  // Nome abreviado
  shortName: import.meta.env.VITE_APP_SHORT_NAME || 'IA',
  
  // Logo da aplicação
  logo: {
    show: import.meta.env.VITE_APP_SHOW_LOGO === 'true', // Controla se mostra ou não a logo
    width: import.meta.env.VITE_APP_LOGO_WIDTH ? parseInt(import.meta.env.VITE_APP_LOGO_WIDTH) : 40,
    height: import.meta.env.VITE_APP_LOGO_HEIGHT ? parseInt(import.meta.env.VITE_APP_LOGO_HEIGHT) : 40,
  },
  
  // Descrição
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Curso completo de Inteligência Artificial',
  
  // Modo de desenvolvimento
  isDevelopment: import.meta.env.MODE === 'development',
};