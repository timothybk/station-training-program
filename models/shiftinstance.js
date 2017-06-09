var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var ShiftInstanceSchema = Schema({
	date: {type: Date, default: Date.now},
	firefighter: {type: Schema.ObjectId, ref: 'FireFighter'},
	pump: String,
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

//export model
module.exports = mongoose.model('ShiftInstance', ShiftInstanceSchema);