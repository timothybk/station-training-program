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

    const promise_appliance = Appliance.find({})
        .populate('qualifications')
        .exec() 

    const promise_firefighter_list = FireFighter.find({})
         .populate('qualifications')
         .exec()

    Promise.all([promise_appliance, promise_firefighter_list])
        .then(([promise_appliance, promise_firefighter_list]) => {
            
            function ShiftsByPump(pump, shifts) {
                    this.pump = pump;
                    this.shifts = shifts;
                }

            for (pump in promise_appliance){
                for (ff in promise_firefighter_list){
                    const toShiftByPump = new ShiftsByPump(pumps, 
                        );
                }
            }
            }
        })

    // const prev_shifts = FireFighter.aggregate()
    //     .lookup({ from: 'shiftinstances', localField: '_id', foreignField: 'firefighter', as: 'shifts' })
    //     .unwind('shifts')
    //     .lookup({ from: 'appliances', localField: 'shifts.pump', foreignField: '_id', as: 'shifts.pump' })
    //     .group({
    //         _id: { name: '$name', pump: '$shifts.pump.name' },
    //         count: { $sum: 1 }
    //     })
    //     .sort({ count: -1 })
    //     .exec()



    // const promise_appliance_list = Appliance.find({})
    //     .populate('qualifications')
    //     .exec()

    // const promise_firefighter_list = FireFighter.find({})
    //     .populate('qualifications')
    //     .exec()

//     Promise.all([prev_shifts, promise_appliance_list, promise_firefighter_list])
//         .then(([prev_shifts, appliance_list, firefighter_list]) => {

//             const back_rankings = () => {
//                 const pumps = [];
//                 const shifts_sorted = [];

//                 function ShiftsByPump(pump, shifts) {
//                     this.pump = pump;
//                     this.shifts = shifts;
//                 }

//                 for (var i = appliance_list.length - 1; i >= 0; i--) {
//                     pumps.push(appliance_list[i])
//                 }

//                 for (var i = pumps.length - 1; i >= 0; i--) {
//                     const shift_array = [];
//                     for (var j = prev_shifts.length - 1; j >= 0; j--) {
//                         if (prev_shifts[j]._id.pump[0] === pumps[i].name) {
//                             shift_array.push(firefighter_list.find((ff) => {
//                                 return ff.name === prev_shifts[j]._id.name;
//                             }));
//                         }
//                     }
//                     for (var k = firefighter_list.length - 1; k >= 0; k--) {
//                         if (shift_array.indexOf(firefighter_list[k]) === -1 && firefighter_list[k].rank != 'Station Officer') {
//                             if (pumps[i].qualifications.length > 0 && firefighter_list[k].qualifications.length > 0 ) {
//                                 function isInArray(arr, val){
//                                     return arr.some(arrVal => 
//                                         val.name === arrVal.name)
//                                 }
//                                 if (isInArray(firefighter_list[k].qualifications, pumps[i].qualifications[0])) {

//                                     shift_array.unshift(firefighter_list[k]);

//                                 }

//                                 } else if (pumps[i].qualifications.length === 0) {
//                                     shift_array.unshift(firefighter_list[k]);
//                                 } else if (pumps[i].name === 'rescuepump') {
//                                     shift_array.push(firefighter_list[k]);
//                                 } 


//                         }

//                     }
//                     const toShiftByPump = new ShiftsByPump(pumps[i], shift_array);
//                     shifts_sorted.push(toShiftByPump);
//                 }
//                 return shifts_sorted;
//             }


//             res.render('shiftinstance_form', {
//                 title: 'Shift create form',
//                 appliance_list: appliance_list,
//                 ranking_list: back_rankings(),
//                 firefighter_list: firefighter_list
//                     //md_list: results.rankings.md_list
//             });
//         })
//         .catch((err) => {
//             return next(err);
//         })



// };
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
                        //successful so render
                        for (var i = errors.length - 1; i >= 0; i--) {
                            req.flash('errors', { msg: errors[i].msg })
                        }
                        //currently redirecting to create_get and losing user input                        
                        res.redirect('create');
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
        req.flash('success', { msg: 'Shift created successfully' });
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
