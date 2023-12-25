const BaseService = require('../base_service')
const messageModel = require('../../models/messagee_model')

class messageService extends BaseService {
  createMessage(name,email,subject,message) {
    return this.create({name,email,subject,message})
  }
  getMessageList(){
    return this.findAll()
  }

  findByMessage(email){
    return this.getSubscriptionByUserId({email})
  }
  getMessageByEmail(email) {
    return this.findOne({ email });
  }
  

  
  
}

module.exports = new messageService(messageModel)