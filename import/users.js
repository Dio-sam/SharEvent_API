const userData = require('./users.json');
const uid2 = require('uid2');

const User = require('../models').User;

// const usersSave = userData.map(function(user) {
//   // delete user.password;
//   // user.dob = new Date(user.dob);
//   // user.token = uid2(16);
//   // return user;
//   User.register()
// });

const saveAllUsers = (users, cb) => {
  let savedUsers = 0;
  for (var i = 0; i < users.length; i++) {
    const password = users[i].password;
    delete users[i].password;
    const userObj = {
      token: uid2(16),
      username: users[i].username,
      email: users[i].username,
      firstName:users[i].firstName,
      lastName:users[i].lastName,
      birthday:users[i].birthday, 
      photo:users[i].photo,
      phone:users[i].phone
    };
    const user = new User(userObj);
    console.log('user', user);
    console.log('userObj', userObj);
    User.register(
      user,
      password, // Password is the second parameter and will be crypted by module
      function(err, obj) {
        if (err) {
          console.error(err);
        } else {
          console.log("saved user " + obj.email);
          savedUsers++;
          if (savedUsers === users.length) {
            cb(null, userData);
          }
        }
      }
    );
  }
}


const importDb = (cb) => {
  User.collection.dropIndexes((err) => {
    if (err) {
      console.log('err#dropIndexes', err);
    }
    User.deleteMany({}, (err) => {
      if (err) {
        console.log('err#drop', err);
      }
      // User.insertMany(usersSave, (err, users) => {
      //   if (err !== null) {
      //     console.log('err#insertMany', err);
      //     cb(err);
      //     return;
      //   }
      //   // console.log('users.length', users.length);
      //   // mongoose.connection.close();
      //   cb(null, users);
      // });
      saveAllUsers(userData, (err, users) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, users);
      })
        // mongoose.connection.close();
    })
    // mongoose.connection.close();
  });
};

module.exports = importDb;