const messageService = require('../services/message/message_service.js')
const validator = require('validator')
const Enum = require('../config/Enum.js')
const axios = require('axios');


const CustomError = require('../lib/Error.js')
const Response = require('../lib/Response.js')
const nodeMailer = require('nodemailer');

require('dotenv').config();

const nodemailer = require('nodemailer');
require('dotenv').config();


async function sendEmailToUser(name, email, message) {
  try {
    // nodemailer transport oluştur
    let transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: true,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD
      }
    });

    // Email içeriği
    let mailOptions = {
      from: process.env.SMPT_MAIL1,
      to: email, // İletişim formunu oluşturan kişinin e-posta adresi
      subject: 'İletişim Formunuz Oluşturuldu.',
      text: `Merhaba ${name},\n\nİletişim formunuz için teşekkür ederiz. En kısa sürede size geri döneceğiz.\n\nMesajınız: ${message}`,
    };

    // Email gönderme işlemi
    await transporter.sendMail(mailOptions);
    console.log('Teşekkür e-postası başarıyla gönderildi.');
  } catch (error) {
    console.error(`Teşekkür e-postası gönderirken hata oluştu: ${error.message}`);
    throw new Error(`Teşekkür e-postası gönderirken hata oluştu: ${error.message}`);
  }
}

async function sendEmailToYourself(name, email, subject, message) {
  try {
    // nodemailer transport oluştur
    let transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: true,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD
      }
    });

    // Email içeriği
    let mailOptions = {
      from: process.env.SMPT_MAIL1,
      to: 'tahakorkut02@gmail.com', // Kendi e-posta adresiniz
      replyTo: `"${name}" <${email}>`, // Gönderenin adı ve e-posta adresini kullanarak Reply-To'yu ayarla
      subject: `Yeni İletişim Formu Oluşturuldu: ${subject}`,
      text: `Yeni bir iletişim formu oluşturuldu.\n\nDetaylar:\nAdı: ${name}\nE-posta: ${email}\nKonu: ${subject}\n\nMesaj: ${message}`,
    };

    // Email gönderme işlemi
    await transporter.sendMail(mailOptions);
    console.log('İletişim formu e-postası başarıyla gönderildi.');
  } catch (error) {
    console.error(`İletişim formu e-postası gönderirken hata oluştu: ${error.message}`);
    throw new Error(`İletişim formu e-postası gönderirken hata oluştu: ${error.message}`);
  }
}

// İletişim oluşturma fonksiyonu
const createMessage = async (req, res, next) => {
  try {
    // Yeni bir iletişim oluştur
   const { ad, email, subject, message } = req.body;
    const contactCreate = await messageService.createMessage(ad, email, subject, message);

    // Gönderici olarak formdan alınan e-posta adresini kullan
    const sender = email;

    // Alıcı adresini env değişkeninden al
    const recipient = process.env.YOUR_EMAIL1;

    // E-posta gönderme işlemi
    await sendEmailToUser(ad, email, message); // ad parametresi burada kullanılıyor

    // Kendinize bildirim e-postası gönderme işlemi
    await sendEmailToYourself(ad, email, subject, message);

    res.status(200).json({ message: 'İletişim mesajı gönderildi' });
  } catch (error) {
    next(error);
  }
};

const getMessage = async (req, res, next) => {
  // abone olan tüm kullanıcıları listeleme
try {
 const contactList = await messageService.getMessageList();
 res.json({ contactList });
} catch (error) {
 console.error('Error while fetching subscribed users:', error);
 res.status(500).json({ error: 'Internal Server Error' });
}
}



module.exports = {
  createMessage,
  getMessage
}