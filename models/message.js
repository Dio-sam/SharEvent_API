let mongoose=require('mongoose');

let schema=require('./schemas').Message;

let Schema=new mongoose.Schema(schema);

let Message = mongoose.model("Message", Schema);

module.exports=Message;