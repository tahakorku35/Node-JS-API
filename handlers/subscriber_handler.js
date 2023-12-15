const subscriberService = require('../services/subscriber_service.js')
const validator = require('validator')
const Enum = require('../config/Enum.js')
const CustomError = require('../lib/Error.js')
const Response = require('../lib/Response.js')
const nodemailer = require('nodemailer');

require('dotenv').config();

const subscriberCreate = async (req, res, next) => {
  const { email } = req.body;

  try {
    // kullanıcıların aboneliğini kontrol etme
    const existingSubscription = await subscriberService.getSubscriptionByEmail(email);

    if (existingSubscription) { 

       // kullanıcı abone ise hata mesajı döndür.

      return res.status(400).json({ success: false, error: 'Kullanıcı zaten abone oldu.' });
    }

    // Yeni abonelik oluştur
    const createdSubscription = await subscriberService.createSubsribe(email);

    // E-posta gönderme

    await sendEmail({
      to: email,
      subject: 'Abonelik Mesajı',
      message: 'Aboneliğiniz Oluşturuldu.',
    });
     
     // Bilgi postası gönderme

        
    await sendEmail({
      to: process.env.YOUR_EMAIL, // Sizin e-posta adresiniz
      subject: 'Siteye Yeni Abone',
      message: `Yeni bir abone: ${email}`,
    });

    res.json({ success: true, createdSubscription });
  } catch (err) {
    // Hata durumunda uygun bir hata mesajı döndürme
    res.status(500).json({ success: false, error: err.message });
  }
};

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    secure: true,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};




const getCreateSubscriber = async (req, res, next) => {
     // abone olan tüm kullanıcıları listeleme
   try {
    const subscribedUsers = await subscriberService.findAllEnroll();
    res.json({ subscribedUsers });
  } catch (error) {
    console.error('Error while fetching subscribed users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



module.exports = {
  subscriberCreate,
  getCreateSubscriber

}
