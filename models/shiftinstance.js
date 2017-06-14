var mongoose = require('mongoose');
var moment = require('moment');
var Appliance = require("../models/appliance");

var Schema = mongoose.Schema;

var ShiftInstanceSchema = Schema({
	date: {type: Date, default: Date.now},
	firefighter: {type: Schema.ObjectId, ref: 'FireFighter'},
	pump: {type: Schema.ObjectId, ref: 'Appliance'},
	shift: String,
	md: Boolean
});

//virtual for ShiftInstance URL
ShiftInstanceSchema
.virtual('url')
.get(function () {
	return '/catalog/shiftinstance/' + this._id;
});

//virtual for moment reformatting of date
ShiftInstanceSchema
.virtual('date_formatted')
.get(function () {
	return moment(this.date).format('MMM Do, YYYY');
});

ShiftInstanceSchema.statics.findByName = function (pumpname, callback) {
  var query = this.findOne()

  Appliance.findOne({name: pumpname}, function (error, appliance) {
    query.where({pump: appliance._id})
    .exec(callback);
  })

  return query
}

//export model
module.exports = mongoose.model('ShiftInstance', ShiftInstanceSchema);