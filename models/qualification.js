var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QualificationSchema = Schema({
    name: String
});

QualificationSchema
    .virtual('url')
    .get(function() {
        return '/qualification/' + this._id;
    });

module.exports = mongoose.model('Qualification', QualificationSchema);
