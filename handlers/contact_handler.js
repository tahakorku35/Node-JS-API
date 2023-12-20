const contactService = require('../services/contact_service.js')
const validator = require('validator')
const Enum = require('../config/Enum.js')
const axios = require('axios');


const CustomError = require('../lib/Error.js')
const Response = require('../lib/Response.js')
const nodeMailer = require('nodemailer');

require('dotenv').config();

const sendEmail = async (options) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure:true,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL, // Only the email address without the name
      to: options.to,
      replyTo: `"${options.ad}" <${options.email}>`, // Include sender's name in the "Reply-To" field
      subject: 'Yeni İletişim Formu Mesajı Konusu: ' + options.subject,
      text: `Ad : ${options.ad}\nE-posta: ${options.email}\nMesaj: ${options.message}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};


// İletişim oluşturma fonksiyonu
const createContact = async (req, res, next) => {
  try {
    // Yeni bir iletişim oluştur
    const { ad, email, subject, message } = req.body;
    const contactCreate = await contactService.createContact(ad, email, subject, message);


    // Gönderici olarak formdan alınan e-posta adresini kullan
    const sender = email;

    // Alıcı adresini env değişkeninden al
    const recipient = process.env.YOUR_EMAIL;

    // E-posta gönderme işlemi
    await sendEmail({ ad, email, subject, message, to: recipient, from: sender });

    res.status(200).json({ message: 'İletişim mesajı gönderildi' });
  } catch (error) {
    next(error);
  }
};



const getContact = async (req, res, next) => {
  // abone olan tüm kullanıcıları listeleme
try {
 const contactList = await contactService.getContactList();
 res.json({ contactList });
} catch (error) {
 console.error('Error while fetching subscribed users:', error);
 res.status(500).json({ error: 'Internal Server Error' });
}
}

const getInstagram = async (req, res, next) => {
  try {
    const accessToken = process.env.INSTAGRAM_API_ACCESS_TOKEN;
    const username = process.env.INSTAGRAM_API_USER_NAME; // Set the username to a constant value

    if (!accessToken) {
      throw new Error('Instagram API access token is missing.');
    }

    if (!username) {
      throw new Error('Username is missing.');
    }

    const apiUrl = `https://graph.instagram.com/${username}/media?access_token=${accessToken}`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.error) {
      throw new Error(`Instagram API Error: ${data.error.message}`);
    }

    const posts = data.data.map((post) => ({
      title: post.title,
      caption: post.caption,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      takenAt: post.taken_at,
    }));

    res.json({ posts });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
}; 


module.exports = {
  createContact,
  getContact,
  getInstagram

}