require('dotenv').config()
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.CHAVE_BREVO;

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

async function sendConfirmationEmail(user){
  
  const {name, email, confirmationToken} = user

  sendSmtpEmail = {
    to: [{
      email: email,
      name: name
    }],
  };
  const baseUrl = process.env.BASE_URL
  const confirmationLink = `${baseUrl}/confirm-email?token=${confirmationToken}`

  sendSmtpEmail.sender = { email: process.env.SENDER_EMAIL, name: 'Time Disc Loom' };
  sendSmtpEmail.subject = 'Confirme seu e-mail';
  sendSmtpEmail.htmlContent = `
  <html>
    <body>
      <h1>Bem-vindo!</h1>
      <p>Por favor, confirme seu e-mail clicando no link abaixo.</p>
      <a href="${confirmationLink}">Confirmar E-mail</a>
    </body>
  </html>
`;  
  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error(error);
  });
}

module.exports = {
    sendConfirmationEmail
}