let mongoose=require('mongoose');

let schema=require('./schemas').Event;

let Schema=new mongoose.Schema(schema);

let Event = mongoose.model("Event", Schema);

module.exports=Event;