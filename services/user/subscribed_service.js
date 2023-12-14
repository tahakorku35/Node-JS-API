const BaseService = require('../base_service')
const subscribedModel = require('../../models/subscribed_model')

class subscribedService extends BaseService {
  createSubsribe(user_id , user_name ) {
    return this.create({user_id, user_name})
  }
  findAllSubsribe(){
    return this.findAll()
  }
  findBySubsribe(user_id){
    return this.getSubscriptionByUserId({user_id})
  }
  getSubscriptionByUserId(user_id) {
    return this.findOne({ user_id }); // findOne ile user_id'ye göre arama yapılır
  }
  

  
  
}

module.exports = new subscribedService(subscribedModel)