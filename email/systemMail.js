var nodemailer = require('nodemailer');

const systemMail = msg => {
  let transport = nodemailer.createTransport({
    host: 'mail.nethely.hu',
    port: 465,
    secure: true,
    auth: {
      user: 'nogradapro@smartbeeweb.hu',
      pass: 'Zsombor2104'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  const message = {
    to: 'develop.tmsmajoros@gmail.com',
    from: 'nogradapro@smartbeeweb.hu',
    subject: 'Felhasználóval kapcsolatos történés',
    text: msg
  };
  transport.sendMail(message, function(err, info) {
    if (err) {
      console.log(err);
    }
  });
};

module.exports = systemMail;
