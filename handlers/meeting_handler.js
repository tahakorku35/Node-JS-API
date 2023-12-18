const validator = require('validator')
const Enum = require('../config/Enum.js')
const CustomError = require('../lib/Error.js')
const Response = require('../lib/Response.js')
const newMeetingService = require('../services/meeting/meeting_service');
const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
const nodemailer = require('nodemailer');

const createMeeting = async (req, res, next) => {
  const { firstname, lastname, phoneNumber, date1, email } = req.body;

  try {
    // Belirtilen tarihte bir görüşme var mı diye kontrol etme
    const existingMeeting = await newMeetingService.getMeetingByDate(date1);

    if (existingMeeting) {
      // Eğer belirtilen tarihte bir görüşme varsa, hata mesajıyla birlikte istemciye başarısızlık (400 hatası) yanıtı gönder
      res.status(400).json({ success: false, message: 'Bu tarihte başka bir görüşme var' });
    } else {
      // Eğer belirtilen tarihte bir görüşme yoksa, yeni görüşmeyi oluştur
      const meeting = await newMeetingService.createMeeting(firstname, lastname, phoneNumber, email, date1);
      console.log(meeting);


      // Email gönderme işlemi görüşmeyi oluşturan kişiye
      await sendEmailToUser(firstname, lastname, phoneNumber, date1, email);

      // Email gönderme işlemi kendi mail adresinize
      await sendEmailToYourself(firstname, lastname, phoneNumber, date1, email);

      // İstemciye başarı durumunda bir yanıt gönder
      res.json({ success: true, message: 'Görüşme oluşturuldu', meeting });
    }
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
};

// Email gönderme fonksiyonu görüşmeyi oluşturan kişiye
async function sendEmailToUser(firstname, lastname, phoneNumber, date1, email) {
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
    from: process.env.SMPT_MAIL,
    to: email, // Görüşmeyi oluşturan kişinin email adresi
    subject: 'Görüşmeniz Oluşturuldu',
    text: `Sayın ${firstname} ${lastname},\n\nGörüşme oluşturduğunuz için teşekkür ederiz. En kısa sürede iletişime geçilecektir.\n\nDetaylarınız:\nTelefon Numarası: ${phoneNumber}\nTarih: ${date1}`,
  };

  // Email gönderme işlemi
  await transporter.sendMail(mailOptions);
}
async function sendEmailToYourself(firstname, lastname, phoneNumber, date1, email) {
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
    from: process.env.SMPT_MAIL,
    to: 'tahakorkut02@gmail.com', // Kendi e-posta adresiniz
    replyTo: `"${firstname}" <${email}>`, // Gönderenin adı ve e-posta adresini kullanarak Reply-To'yu ayarla
    subject: 'Yeni Görüşme Oluşturuldu',
    text: `Yeni bir görüşme oluşturuldu.\n\nDetaylar:\nAdı: ${firstname}\nSoyadı: ${lastname}\nTelefon Numarası: ${phoneNumber}\nTarih: ${date1}\nEmail: ${email}`,
  };

  // Email gönderme işlemi
  await transporter.sendMail(mailOptions);
}
const updateMeeting = async (req, res, next) => {
  const { firstname, lastname, phoneNumber, date1 } = req.body;
  const _id = req.params.id;

const obj = {
    firstname: firstname,
    lastname: lastname,
    phoneNumber: phoneNumber,
    date1: date1
  };

try {
    // Güncellenmiş meetingService fonksiyonunu kullanarak görüşmeyi güncelle
    const updatedMeeting = await newMeetingService.updateReservationService(_id, obj);

// Email gönderme işlemi - Görüşmeyi güncelleyen kişiye
    await sendEmailToUser(firstname, lastname, phoneNumber, date1, updatedMeeting.email);

// Email gönderme işlemi - Kendi mail adresinize
    await sendEmailToYourself(firstname, lastname, phoneNumber, date1, updatedMeeting.email);

// İstemciye başarı durumunda bir yanıt gönder
    res.json({ success: true, message: 'Görüşme güncellendi ve e-posta gönderildi', meeting: updatedMeeting });
  } catch (err) {
    // Hata durumunda uygun bir hata yanıtı gönder
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
};











const getMeeting = async (req, res, next) => {

  try {
    const meeting = await newMeetingService.findAllMeeting();
    console.log(meeting); // Fix: Use 'meeting' instead of 'reservations'

    // You may want to send a response back to the client here if needed
    res.json({ success: true, message: 'Oluşturulan görüşmeler listelendi' });
  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
};



module.exports = {
  createMeeting,
  updateMeeting,
  getMeeting

}


