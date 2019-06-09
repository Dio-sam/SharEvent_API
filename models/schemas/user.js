module.exports = {
  firstName: String,
  password: String,
  username: String,
  lastName:String,
  email: String,
  token: String,
  birthday: String, 
  photo:String,
  phone:String,
  created: {
    type: Date,
    default: Date.now
  }
};
