const rawData = require('./events.json');

const EventModel = require("../models").Event;

const importDb = (cb) => {
  EventModel.collection.dropIndexes((err) => {
    if (err) {
      console.log('events err#dropIndexes', err);
    }
    EventModel.deleteMany({}, (err) => {
      if (err) {
        console.log('events err#drop', err);
      }
      EventModel.insertMany(rawData, (err, data) => {
        if (err !== null) {
          console.log('events err#insertMany', err);
          cb(err);
          return;
        }
        // console.log('users.length', users.length);
        // mongoose.connection.close();
        cb(null, data);
      });
        // mongoose.connection.close();
    })
    // mongoose.connection.close();
  });
};

module.exports = importDb;