var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StagedShiftSchema = Schema({
	FireFighters: Array,
});

StagedShiftSchema
.virtual('url')
.get(function () {
	return '/drill/' + this._id;
});

module.exports = mongoose.model('StagedShift', StagedShiftSchema);