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
 
  async findByProperties(properties) {
    return await this.model.find(properties)
  }
  findOne(condition) {
    return this.model.findOne(condition);
  }

}

module.exports = BaseService