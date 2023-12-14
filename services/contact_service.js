const BaseService = require('./base_service')
const contactModel = require('../models/contact_model')

class contactService extends BaseService {
  createContact(ad,email,subject,message) {
    return this.create({ad,email,subject,message})
  }
  findAllContact(){
    return this.findAll()
  }
  findByContact(email){
    return this.getSubscriptionByUserId({email})
  }
  getContactByEmail(email) {
    return this.findOne({ email });
  }
  

  
  
}

module.exports = new contactService(contactModel)