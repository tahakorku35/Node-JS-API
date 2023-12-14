const BaseService = require('../base_service')
const UserModel = require('../../models/user_model')

class UserService extends BaseService {
  async createUser(user) {
    return await this.create(user)
  }
  async getAllUsers() {
    return await this.findAll();
  }

  async findByEmail(email) {
    return await this.findOneByProperty('email', email)
  }

  async updateToken(id, token) {
    return await this.update(id, { token })
  }
  async deleteUser(id){
    return await this.delete(id)
  }

  async updatePasswordUser(id, password) {
    return await this.update(id, { password })
  }
 
  
}

module.exports = new UserService(UserModel)