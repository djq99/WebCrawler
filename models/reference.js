'use strict';
var mongoose = require('mongoose');

var Reference_Schema = mongoose.Schema({
	URL : {
		type: String
	},
	links:{
		type : [String]
	}
})

var reference = module.exports = mongoose.model('reference', Reference_Schema);

module.exports.getLinks = function(URL,callback){
	reference.findOne({URL : URL}, callback);
}

module.exports.saveLinks = function(record, callback){
	var newRecord =  new reference(record);
	newRecord.save(callback);
}
exports.module = reference;