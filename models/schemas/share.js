let mongoose=require('mongoose')
module.exports = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  files:[String],
  contacts:[Object],
  main_ideas:Object,
  summarize:String,
  created: {
    type: Date,
    default: Date.now
  }
}


