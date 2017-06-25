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

//Display ShiftInstance create form on GET

exports.shiftinstance_create_get = function(req, res, next) {
    var firefighter_listing;
    var md_listing;
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
                                callback(null, results);
                            });
                    },
                    firefighter_list: function(callback) {
                        FireFighter.find({})
                            .populate('qualifications')
                            .exec(function(err, results) {
                                if (err) {
                                    return next(err);
                                }
                                callback(null, results);
                            });
                    },
                    md_list: function(callback) {
                        Qualification.find({ 'name': 'md' })
                            .exec(function(err, results) {
                                if (err) {
                                    return next(err);
                                }
                                FireFighter.find({})
                                    .where('qualifications').in(results)
                                    .exec(function(err, results) {
                                        if (err) {
                                            return next(err);
                                        }

                                        callback(null, results);
                                    });
                            });
                    }
                }, function(err, list_parallel) {
                    if (err) {
                        return next(err);
                    }
                    firefighter_listing = list_parallel.firefighter_list;
                    md_listing = list_parallel.md_list;
                    callback(null, list_parallel);
                });
            },
            rankings: function(callback) {
                async.parallel({
                        back_list: function(callback) {
                            async.waterfall([
                                function(callback) {
                                    Appliance.find({}, 'name')
                                        .exec(function(err, appliance_names) {
                                            if (err) {
                                                return next(err);
                                            }
                                            callback(null, appliance_names);
                                        });
                                },
                                function(appliance_names, callback) {
                                    async.mapValues(
                                        appliance_names,
                                        function(appliance, key, callback) {
                                            var firefighter_list = firefighter_listing;
                                            async.sortBy(firefighter_list, function(firefighter, callback) {
                                                ShiftInstance.find({})
                                                    .populate('firefighter')
                                                    .populate('pump')
                                                    .where('firefighter').equals(firefighter._id.toString())
                                                    .where('pump').equals(appliance_names[key]._id.toString())
                                                    .exec(function(err, shift_instances) {
                                                        if (err) {
                                                            return next(err);
                                                        } else if (shift_instances.length === 0 || shift_instances === undefined) {
                                                            callback(err, 0);
                                                        } else {
                                                            callback(err, shift_instances.length);
                                                        }
                                                    });
                                            }, function(err, results) {
                                                if (err) {
                                                    return next(err);
                                                }
                                                callback(null, results);
                                            });
                                        },
                                        function(err, mapResults) {
                                            if (err) {
                                                return next(err);
                                            }
                                            callback(null, mapResults);
                                        });
                                }
                            ], function(err, rankingsWaterfallResults) {
                                if (err) {
                                    return next(err);
                                }
                                callback(null, rankingsWaterfallResults);
                            });

                        },
                        md_list: function(callback) {
                            async.waterfall([
                                function(callback) {
                                    Appliance.find({}, 'name')
                                        .exec(function(err, appliance_names) {
                                            if (err) {
                                                return next(err);
                                            }
                                            callback(null, appliance_names);
                                        });
                                },
                                function(appliance_names, callback) {
                                    async.mapValues(
                                        appliance_names,
                                        function(appliance, key, callback) {
                                            var firefighter_list = md_listing;
                                            async.sortBy(firefighter_list, function(firefighter, callback) {
                                                ShiftInstance.find({})
                                                    .populate('firefighter')
                                                    .populate('pump')
                                                    .where('firefighter').equals(firefighter._id.toString())
                                                    .where('pump').equals(appliance_names[key]._id.toString())
                                                    .exec(function(err, shift_instances) {
                                                        if (err) {
                                                            return next(err);
                                                        } else if (shift_instances.length === 0 || shift_instances === undefined) {
                                                            callback(err, 0);
                                                        } else {
                                                            callback(err, shift_instances.length);
                                                        }
                                                    });
                                            }, function(err, results) {
                                                if (err) {
                                                    return next(err);
                                                }
                                                callback(null, results);
                                            });
                                        },
                                        function(err, mapResults) {
                                            if (err) {
                                                return next(err);
                                            }
                                            callback(null, mapResults);
                                        });
                                }
                            ], function(err, rankingsWaterfallResults) {
                                if (err) {
                                    return next(err);
                                }
                                callback(null, rankingsWaterfallResults);
                            });

                        }
                    }, function(err, rankings_parallel) {
                        if (err) {
                            return next(err);
                        }
                        callback(null, rankings_parallel);
                    }


                );
            }
        },
        function(err, results) {
            if (err) {
                return next(err);
            }
            res.render('shiftinstance_form', {
                title: 'Shift create form',
                appliance_list: results.lists.appliance_list,
                ranking_lists: results.rankings.back_list,
                md_list: results.rankings.md_list
            });
        }
    );
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

                res.render('shiftinstanceOne_form', {
                    title: 'Change fire fighter',
                    current_shiftinstance: current_shiftinstance,
                    firefighter_list: firefighter_list,
                    errors: errors
                });
            });
    } else {

        //data from form is valid. update record
        ShiftInstance.findByIdAndUpdate(req.params.id, {
            firefighter: req.body.firefighter
        }, {}, function(err, theshiftinstance) {
            if (err) {
                return next(err);
            }
            //successfull -redirect to firefighter detail
            res.redirect(theshiftinstance.url);
        });
    }


};
