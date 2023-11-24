class BaseService {
  constructor(model) {
    this.model = model
  }


  // model oluşturma
  async create(object) {
    return await this.model.create(object)
  }

  //belirtilen özelliğe göre çekme
  async findByProperty(property, value) {
    return this.model.find({ [property]: value })
  }

  //id ye göre çekme
  async findById(id) {
    return this.model.findById(id)
  }

  async findOneByProperty(property, value) {
    return await this.model.findOne({ [property]: value })
  }

  //tüm modeli çekme
  async findAll() {
    return this.model.find()
  }
  async findAllPopularVillas() {
    return this.model.find().sort({'villa_popular': -1}).limit(10)  }

  //id ye göre güncelleme
  async update(id, object) {
    return await this.model.findByIdAndUpdate(id, object, { new: true })
  }

  async updateByProperty(property, value, object) {
    return await this.model.updateOne({ [property]: value }, object)
  }

  //id ye göre silme
  async delete(id) {
    return await this.model.findByIdAndDelete(id)
  }
  async deleteByProperty(property, value) {
    return await this.model.deleteOne({ [property]: value })
  }

  async findByQuery(query) {
    return await this.model.find(query)
  }
  async findLastRatingSortedByDate(villa_id) {
    return await this.model.findOne({ villa_id }).sort({ date: -1 });
  }
  async findNextSortedByDateUser(user_id) {
    return await this.model.findOne({ user_id }).sort({ date: 1 });
  }
  async findLastSortedByDateUser(user_id) {
    return await this.model.find({ user_id }).limit(5);
  }
  async findByProperties(properties) {
    return await this.model.find(properties)
  }

}

module.exports = BaseService