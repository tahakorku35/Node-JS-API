const BaseService = require('./base_service')
const enrollModel = require('../models/enroll_model')

class enrollService extends BaseService {
  createSubsribe(email) {
    return this.create({email})
  }
  findAllEnroll(){
    return this.findAll()
  }
  findBySubsribe(email){
    return this.getSubscriptionByUserId({email})
  }
  getSubscriptionByEmail(email) {
    return this.findOne({ email });
  }
  

  
  
}

module.exports = new enrollService(enrollModel)