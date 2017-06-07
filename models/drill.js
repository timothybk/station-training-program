var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DrillSchema = Schema({
	code: String,
	name: String
});

DrillSchema
.virtual('fulltitle')
.get(function () {
	return this.code + ': ' + this.name;
})

DrillSchema
.virtual('url')
.get(function () {
	return '/catalog/drill/' + this._id;
});

module.exports = mongoose.model('Drill', DrillSchema);