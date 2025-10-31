require('dotenv').config(); // Adicione esta linha no topo

const nodemailer = require('nodemailer');

// Verifique se as variáveis estão carregadas
console.log('Variáveis de ambiente carregadas:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USERNAME:', process.env.SMTP_USERNAME ? '***' : 'não definido');

// Configuração segura com fallback
const config = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // Fallback para Gmail
  port: parseInt(process.env.SMTP_PORT) || 587,     // Converte para número
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
};

console.log('\nConfiguração SMTP que será usada:');
console.log(config);

const transporter = nodemailer.createTransport(config);

console.log('\nTestando conexão com:', config.host + ':' + config.port);

transporter.verify((error, success) => {
  if (error) {
    console.error('\nERRO NA CONEXÃO:', error);
    console.log('\nPossíveis soluções:');
    console.log('1. Verifique se o arquivo .env está na raiz do projeto');
    console.log('2. Confira os valores no .env (sem aspas, sem espaços)');
    console.log('3. Para Gmail: ative "Aplicativos menos seguros" ou use senha de app');
    console.log('4. Teste com Mailtrap (sandbox.smtp.mailtrap.io) se for desenvolvimento');
  } else {
    console.log('\nSUCESSO: Servidor SMTP pronto para receber mensagens');
    
    // Teste de envio real
    transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: 'mmessiasdev@gmail.com',
      subject: 'Teste SMTP',
      text: 'Este é um e-mail de teste do Strapi'
    }, (err, info) => {
      if(err) {
        console.error('Erro no envio:', err);
      } else {
        console.log('E-mail enviado com sucesso:', info.response);
      }
    });
  }
});