let mongoose=require('mongoose')
module.exports={
  name:String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  summary:String,
  description:String,
  address:String,
  location: {
    lat: Number,
    lng: Number
  },
  url:String,
  picture:String,
  is_free:Boolean,
  start:Date,
  end:Date,
}
