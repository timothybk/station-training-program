var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var DrillInstanceSchema = Schema({
	date: {type: Date, default: Date.now},
	leader: {type: Schema.ObjectId, ref: 'FireFighter'},
	drill: {type: Schema.ObjectId, ref: 'Drill'},
	firefighters: [{type: Schema.ObjectId, ref: 'FireFighter'}]
});

//virtual for CountInstance URL
DrillInstanceSchema
.virtual('url')
.get(function () {
	return '/catalog/drillinstance/' + this._id;
});

//virtual for moment reformatting of date
DrillInstanceSchema
.virtual('date_formatted')
.get(function () {
	return moment(this.date).format('MMM Do, YYYY');
});

//export model
module.exports = mongoose.model('DrillInstance', DrillInstanceSchema);