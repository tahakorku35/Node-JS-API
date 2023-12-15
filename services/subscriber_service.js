const BaseService = require('./base_service')
const SubscriberModel = require('../models/subscriber_model')

class subscriberService extends BaseService {
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

module.exports = new subscriberService(SubscriberModel)