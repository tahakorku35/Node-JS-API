const BaseService = require('../base_service');
const UserDetailModel = require('../../models/user_details_model');

class UserDetailService extends BaseService {
  async createUserDetail(userId, user_name, first_name, last_name, address, email, phone, user_type, age) {
    return await this.create({ userId, user_name, first_name, last_name, address, email, phone, user_type, age });
  }

  async deleteUserDetailByUserId(userId) {
    return await this.deleteByProperty('userId', userId);
  }

  async findUserDetailByUserId(userId) {
    return await this.findOneByProperty('userId', userId);
  }

  async updateUser(id, obj) {
    return await this.updateByProperty("userId", id, obj);
  }

  async findUserByEmail(email) {
    return await this.findOneByProperty('email', email);
  }
}

module.exports = new UserDetailService(UserDetailModel);
