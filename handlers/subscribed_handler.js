const subscribedService = require('../services/user/subscribed_service.js')
const validator = require('validator')
const Enum = require('../config/Enum.js')
const CustomError = require('../lib/Error.js')
const Response = require('../lib/Response.js')



const subscribeUser = async (req, res, next) => {
  const { user_id, user_name } = req.body;

  try {
    // kullanıcının abone olup olmadığını kontrol etme
    const existingSubscription = await subscribedService.getSubscriptionByUserId(user_id);

    if (existingSubscription) {
      // Kullanıcı zaten abone ise hata mesajı döndür
      return res.status(400).json({ success: false, error: 'kullanıcı zaten abone oldu.' });  // hata 
    }

    // Yeni abonelik oluştur
    const createdSubscription = await subscribedService.createSubsribe(user_id, user_name /* giriş yapan kullanıcının user_id ve user_name'i alır*/);

    res.json({ success: true, createdSubscription });
  } catch (err) {
    // Hata durumunda uygun bir hata mesajı döndürme
    res.status(500).json({ success: false, error: err.message });
  }
}







const getSubscribedUser = async (req, res, next) => {
     // abone olan tüm kullanıcıları listeleme
   try {
    const subscribedUsers = await subscribedService.findAllSubsribe();
    res.json({ subscribedUsers });
  } catch (error) {
    console.error('Error while fetching subscribed users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



module.exports = {
 subscribeUser,
  getSubscribedUser

}
