let mongoose = require("mongoose");

var passportLocalMongoose = require("passport-local-mongoose");

let schema = require("./schemas").User;

let Schema = new mongoose.Schema(schema);

Schema.plugin(passportLocalMongoose, {
  usernameField: "email", // username is actually an email
  session: false // API doesn't use sessions
});

//  Cette méthode sera utilisée par la strategie `passport-local` pour trouver un utilisateur en fonction de son `email` et `password`Schema.statics.authenticateLocal = function() {
  Schema.statics.authenticateLocal = function() {
    var _self = this;
    return function(req, email, password, cb) {
      _self.findByUsername(email, true, function(err, user) {
        if (err) return cb(err);
        if (user) {
          return user.authenticate(password, cb);
        } else {
          return cb(null, false);
        }
      });
    };
  };
// Find an user by its token
Schema.statics.authenticateBearer = function() {
  var _self = this;

  return function(token, cb) {
    console.log('#authenticateBearer token', token);
    if (!token) {
      console.log('#authenticateBearer #1');
      cb(null, false);
    } else {
      _self.findOne({ token: token }, function(err, user) {
        console.log('#authenticateBearer #2');
        if (err) return cb(err);
        if (!user) return cb(null, false);
        return cb(null, user);
      });
    }
  };
};

let User = mongoose.model("User", Schema);


module.exports = User;

