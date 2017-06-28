var FireFighter = require('./models/firefighter');
var Drill = require('./models/drill');
var DrillInstance = require('./models/drillinstance');
var Qualification = require('./models/qualification');
var ShiftInstance = require('./models/shiftinstance')

var async = require('async');

module.exports = {
    //find all drills completed by a fire fighter
	firefighter_find_all_drills: function (id, cb) {
		async.parallel({
        firefighter: function(callback) {

            FireFighter.findById(id)
                .populate('qualifications')
                .populate('drills')
                .exec(callback);
        },

        drillinstance_list: function(callback) {
            DrillInstance.find({ 'firefighters': id }, 'drill leader date')
                .populate('drill')
                .populate('leader')
                .sort('-date')
                .exec(callback);
        },
        
        shiftinstance_list: function (callback) {
            ShiftInstance.find({'firefighter': id})
            .populate('pump')
            .sort('-date')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) {

            return next(err);
        }
        
        return cb(results);
    })
	}
}