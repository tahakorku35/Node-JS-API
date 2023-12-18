const MeetingModel = require('../../models/meeting_model');
const BaseService = require('../base_service');


class newMeetingService extends BaseService {
  createMeeting(firstname, lastname, phoneNumber, email, date1) {
    return this.create({ firstname, lastname, phoneNumber, email, date1 });
  }

  updateReservationService(id, obj) {
    return this.update(id, obj);
  }

  getMeetingByDate(date1) {
    return this.findOneByProperty('date1', date1);
  }

  deleteMeeting(id) {
    return this.delete(id);
  }
}

module.exports = new newMeetingService(MeetingModel);
