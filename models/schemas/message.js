let mongoose=require('mongoose');
module.exports={
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }, 
  // recipient:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // },
  message:String,
  created: {
    type: Date,
    default: Date.now
  }
}