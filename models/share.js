let mongoose=require('mongoose');

let schema=require('./schemas').Share;

let Schema=new mongoose.Schema(schema);

let Share = mongoose.model("Share", Schema);

module.exports=Share;

