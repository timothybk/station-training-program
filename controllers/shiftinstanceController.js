var ShiftInstance = require('../models/shiftinstance');
var FireFighter = require('../models/firefighter');
var Appliance = require('../models/appliance');
//var Qualification = require('../models/qualification');
var ShiftInstance = require('../models/shiftinstance');

var async = require('async');

// Display list of all ShifTinstances
exports.shiftinstance_list = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance list');
};

// Display detail page for a specific ShiftInstance
exports.shiftinstance_detail = function(req, res, next) {
    ShiftInstance.findById(req.params.id)
        .populate('firefighter')
        .populate('pump')
        .exec(function(err, result) {
            if (err) {
                return next(err);
            }
            //success so render
            res.render('shiftinstance_detail', {
                title: 'FireFighter:',
                shiftinstance: result
            });
        });
};

//Display ShiftInstance create form on GET

exports.shiftinstance_create_get = function(req, res, next) {
    var appliance_listing;
    var firefighter_listing;
    async.series({
        lists: function(callback) {
            async.parallel({
                appliance_list: function(callback) {
                    Appliance.find({})
                        .populate('qualifications')
                        .exec(function(err, results) {
                            if (err) {
                                return next(err);
                            }
                            console.log('parallel-appliancelist');
                            callback(null, results);
                        });
                },
                firefighter_list: function(callback) {
                    FireFighter.find({})
                        .populate('qualifications')
                        .sort('-rank number')
                        .exec(function(err, results) {
                            if (err) {
                                return next(err);
                            }
                            console.log('parallel-firefighterlist');
                            callback(null, results);
                        });

                }
            }, function(err, list_parallel) {
                if (err) {
                    return next(err);
                }
                appliance_listing = list_parallel.appliance_list;
                firefighter_listing = list_parallel.firefighter_list;
                console.log('series-lists');
                callback(null, list_parallel);
            });
        },

        rankings: function(callback) {
            var appliance_array = [];
            async.series([
                function(callback) {
                    Appliance.find({}, 'name')
                        .exec(function(err, appliance_names) {
                            if (err) {
                                return next(err);
                            }
                            appliance_array = appliance_names;
                            console.log('rankings-series-appliancefind');
                            callback();
                        });
                },
                function(callback) {
                    async.map(appliance_array, function(appliance, callback) {
                        var rankings = firefighter_listing;
                        ShiftInstance.aggregate([{
                                $match: {
                                    pump: appliance._id
                                }
                            }, {
                                $group: {
                                    _id: '$firefighter',
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }, {
                                $sort: {
                                    count: 1
                                }
                            }

                        ], function(err, counts) {
                            if (err) {
                                return next(err);
                            }
                            FireFighter.populate(counts, { path: '_id' }, function(err, counts) {
                                if (err) {
                                    return next(err);
                                }
                                async.eachOf(rankings, function(list_firefighter, key, callback) {
                                    async.each(counts, function(count_firefighter, callback) {
                                        //var times = 1;
                                        if (list_firefighter == count_firefighter) {
                                            rankings.push(rankings.splice(key, 1)[0]);
                                        }
                                        //console.log('each-inner' + times);
                                        //times++;
                                        callback();
                                    });
                                    console.log('each-outer' + key);
                                    callback();
                                });
                            });
                            console.log('aggregate end');
                            callback();
                        });


                    }, function(err, mapResults) {
                        if (err) {
                            return next(err);
                        }
                        console.log('map end');
                        callback(mapResults);
                    });
                },
                function(err, mapResults) {
                    if (err) {
                        return next(err);
                    }
                    console.log('map function end');
                    callback(null, mapResults);
                }
            ]);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        console.log('final callback');
        res.render('shiftinstance_form', {
            title: 'Shift create form',
            appliance_list: results.lists.appliance_list,
            ranking_lists: results.rankings,
            md_list: results.rankings.lists.firefighter_list
        });
    });

};
// Handle ShiftInstance create on POST
exports.shiftinstance_create_post = function(req, res, next) {
    var appliance_arr = [];
    var shiftinstance_array = [];


    async.series([
        function(callback) {
            Appliance.find({}, 'name seats')
                .exec(function(err, appliances) {
                    if (err) {
                        return next(err);
                    }
                    appliance_arr = appliances;
                    callback();

                });

        },

        function(callback) {
            req.checkBody('date', 'Invalid date').isDate();

            for (var i = 0; i < appliance_arr.length; i++) {
                for (var j = 0; j < appliance_arr[i].seats.length; j++) {
                    req.checkBody(appliance_arr[i].name + appliance_arr[i].seats[j], appliance_arr[i].name + '' +
                        appliance_arr[i].seats[j] + 'must be specified').notEmpty();
                }

            }

            req.checkBody('shift', 'Shift must be specified').notEmpty();
            req.sanitize('date').toDate();

            for (var i = 0; i < appliance_arr.length; i++) {
                for (var j = 0; j < appliance_arr[i].seats.length; j++) {
                    req.sanitize(appliance_arr[i].name + appliance_arr[i].seats[j]).escape();
                    req.sanitize(appliance_arr[i].name + appliance_arr[i].seats[j]).trim();
                }
            }

            req.sanitize('shift').escape();
            req.sanitize('shift').trim();
            req.sanitize('md').escape();

            var total = 0;


            for (var i = 0; i < appliance_arr.length; i++) {
                for (var j = 0; j < appliance_arr[i].seats.length; j++) {
                    var isMD = false;
                    if (appliance_arr[i].seats[j] == 'driver') {
                        isMD = true;
                    }

                    shiftinstance_array[total] = new ShiftInstance({
                        date: req.body.date,
                        firefighter: req.body[appliance_arr[i].name + appliance_arr[i].seats[j]],
                        pump: appliance_arr[i],
                        shift: req.body.shift,
                        md: isMD
                    });
                    total++;
                }
            }





            var errors = req.validationErrors();
            if (errors) {
                FireFighter.find({}, 'name')
                    .exec(function(err, firefighters) {
                        if (err) {
                            return callback(err);

                        }
                        //successful fo render
                        res.render('shiftinstance_form', {
                            title: 'Create ShiftInstance',
                            firefighter_list: firefighters,
                            shiftinstance: shiftinstance_array[total],
                            errors: errors
                        });
                    });
                return;
            } else {
                //Data from form is valid
                async.each(shiftinstance_array, function(shiftinstance, callback) {
                    shiftinstance.save();
                    callback();
                }, function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                });

            };
            callback();

        }
    ], function(err) {
        if (err) {
            return next(err);
        }

        res.redirect('create')
    })
};

// Display ShiftInstance delete form on GET
exports.shiftinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance delete GET');
};

// Handle ShiftInstance delete on POST
exports.shiftinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance delete POST');
};

// Display ShiftInstance update form on GET
exports.shiftinstance_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get shiftInstance, firefighter for form
    async.parallel({
        firefighter_list: function(callback) {
            FireFighter.find(callback);
        },
        current_shiftinstance: function(callback) {
            ShiftInstance.findById(req.params.id)
                .populate('firefighter')
                .populate('pump')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.render('shiftinstanceOne_form', {
            title: 'Change fire fighter',
            firefighter_list: results.firefighter_list,
            current_shiftinstance: results.current_shiftinstance
        })
    });
};

// Handle shiftinstance update on POST
exports.shiftinstance_update_post = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('firefighter', 'firefighter must not be empty').notEmpty();
    req.sanitize('firefighter').escape();
    req.sanitize('firefighter').trim();

    console.log(req.body.firefighter)




    var errors = req.validationErrors();
    if (errors) {
        //rerender ff with error info
        //get all quals for form
        FireFighter.find({})
            .exec(function(err, firefighter_list) {
                if (err) {
                    return next(err);
                }

                res.render('shiftinstanceOne_form', { title: 'Change fire fighter', current_shiftinstance: current_shiftinstance, firefighter_list: firefighter_list, errors: errors });
            });
    } else {

        //data from form is valid. update record
        ShiftInstance.findByIdAndUpdate(req.params.id, { firefighter: req.body.firefighter }, {}, function(err, theshiftinstance) {
            if (err) {
                return next(err);
            }
            //successfull -redirect to firefighter detail
            res.redirect(theshiftinstance.url);
        });
    }


};
