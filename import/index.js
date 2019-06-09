require('dotenv').config();
const mongoose = require('mongoose');
const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const importEvents = require('./events.js');
const importUsers = require('./users.js');
mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  useNewUrlParser: true,
  useCreateIndex: true
});
importUsers((err, users) => {
  if (err !== null) {
    console.log('#importUsers err', err);
    return;
  }
  console.log(`Users: ${users.length} imported successfully`);
  importEvents((err, events) => {
    if (err !== null) {
      console.log('#importevents err', err);
      return;
    }
    console.log(`Events: ${events.length} imported successfully`);
        mongoose.connection.close();
  });
});
