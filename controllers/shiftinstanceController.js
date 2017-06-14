var ShiftInstance = require('../models/shiftinstance');
var FireFighter = require('../models/firefighter');
var Appliance = require('../models/appliance');
var Qualification = require('../models/qualification');
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

// Display ShiftInstance create form on GET
exports.shiftinstance_create_get = function(req, res, next) {
    async.parallel({
        appliance_list: function(callback) {
            Appliance.find({})
                .populate('qualifications')
                .exec(callback)
        },
        firefighter_list: function(callback) {
            FireFighter.find({})
                .populate('qualifications')
                .sort('-rank number')
                .exec(callback)
        },
        flyer_rankings: function(callback) {
            async.waterfall([
                function(callback) {
                    var pumper = ShiftInstance.findByName('flyer', function(err, pump) {
                        if (err) {
                            res.send(err);
                        }
                    });
                    callback(null, pumper)
                },
                function(pumper, callback) {
                    var count_populated;
                    ShiftInstance.aggregate([{
                            $match: {
                                _id: pumper._id
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
                        FireFighter.populate(counts, {
                            path: '_id'
                        }, function(err, counts) {
                            if (err) {
                                return next(err);
                            }
                            console.log(pumper);
                            count_populated = counts;
                            console.log(count_populated);
                        })
                    })
                    callback(null, count_populated);
                }
            ], function(err, newResult) {
                if (err) {
                    return next(err);
                }
                else {
                    callback(newResult);
                }
            });
        },
        runner_rankings: function(callback) {
            ShiftInstance.aggregate([{
                    $match: {
                        pump: 'runner'
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

            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                FireFighter.populate(result, {
                    path: '_id'
                }, function(err, newResult) {

                    if (err) {
                        return next(err);
                    }

                    callback(null, newResult);
                })
            })
        },
        rescue_pump_rankings: function(callback) {
            ShiftInstance.aggregate([{
                    $match: {
                        pump: 'rescuepump'
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

            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                FireFighter.populate(result, {
                    path: '_id'
                }, function(err, newResult) {

                    if (err) {
                        return next(err);
                    }

                    callback(null, newResult);
                })
            })
        },
        salvage_rankings: function(callback) {
            ShiftInstance.aggregate([{
                    $match: {
                        pump: 'salvage'
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

            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                FireFighter.populate(result, {
                    path: '_id'
                }, function(err, newResult) {

                    if (err) {
                        return next(err);
                    }

                    callback(null, newResult);
                })
            })
        },
        bronto_rankings: function(callback) {
            ShiftInstance.aggregate([{
                    $match: {
                        pump: 'bronto'
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

            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                FireFighter.populate(result, {
                    path: '_id'
                }, function(err, newResult) {

                    if (err) {
                        return next(err);
                    }

                    callback(null, newResult);
                })
            })
        },
        md_rankings: function(callback) {
            ShiftInstance.aggregate([{
                    $match: {
                        md: true
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

            ], function(err, result) {
                if (err) {
                    return next(err);
                }
                FireFighter.populate(result, {
                    path: '_id'
                }, function(err, newResult) {

                    if (err) {
                        return next(err);
                    }

                    callback(null, newResult);
                })
            })
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        var flyer_array = [];
        var runner_array = [];
        var rescue_pump_array = [];
        var salvage_array = [];
        var bronto_array = [];
        var md_array = [];
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            flyer_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.flyer_rankings.length; i++) {
            for (var j = 0; j < flyer_array.length; j++) {
                if (flyer_array[j].name == results.flyer_rankings[i]._id.name) {
                    flyer_array.push(flyer_array.splice(j, 1)[0])
                }

            }
        }
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            runner_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.runner_rankings.length; i++) {
            for (var j = 0; j < runner_array.length; j++) {
                if (runner_array[j].name == results.runner_rankings[i]._id.name) {
                    runner_array.push(runner_array.splice(j, 1)[0])
                }

            }
        }
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            rescue_pump_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.rescue_pump_rankings.length; i++) {
            for (var j = 0; j < rescue_pump_array.length; j++) {
                if (rescue_pump_array[j].name == results.rescue_pump_rankings[i]._id.name) {
                    rescue_pump_array.push(rescue_pump_array.splice(j, 1)[0])
                }

            }
        }
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            salvage_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.salvage_rankings.length; i++) {
            for (var j = 0; j < salvage_array.length; j++) {
                if (salvage_array[j].name == results.salvage_rankings[i]._id.name) {
                    salvage_array.push(salvage_array.splice(j, 1)[0])
                }

            }
        }
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            bronto_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.bronto_rankings.length; i++) {
            for (var j = 0; j < bronto_array.length; j++) {
                if (bronto_array[j].name == results.bronto_rankings[i]._id.name) {
                    bronto_array.push(bronto_array.splice(j, 1)[0])
                }

            }
        }
        //create an array from mongooose results
        for (var i = 0; i < results.firefighter_list.length; i++) {
            md_array.push(results.firefighter_list[i])
        }
        //find names with previous shift instance and move to end of list
        for (var i = 0; i < results.md_rankings.length; i++) {
            for (var j = 0; j < md_array.length; j++) {
                if (md_array[j].name == results.md_rankings[i]._id.name) {
                    md_array.push(md_array.splice(j, 1)[0])
                }

            }
        }


        res.render('shiftinstance_form', {
            title: 'Shift create form',
            appliance_list: results.appliance_list,
            flyer_list: flyer_array,
            runner_list: runner_array,
            rescue_pump_list: rescue_pump_array,
            salvage_list: salvage_array,
            bronto_list: bronto_array,
            md_list: md_array
        })

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
                    appliance_arr = appliances
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
                };
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
            }
            else {
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
exports.shiftinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance update GET');
};

// Handle shiftinstance update on POST
exports.shiftinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance update POST');
};
