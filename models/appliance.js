var mongoose = require("mongoose");

var Schema = mongoose.Schema

var ApplianceSchema = Schema({
    name: String,
    seats: [String],
    qualifications: [{type: Schema.ObjectId, ref: 'Qualification'}]
});

ApplianceSchema
.virtual('url')
.get(function () {
    return '/appliance/' + this._id;
});

module.exports = mongoose.model('Appliance', ApplianceSchema);