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
exports.shiftinstance_create_get = function(req, res, next) {};
//     var appliance_listing;
//     var firefighter_listing;
//     async.series({
//             lists: function(callback) {
//                 async.parallel({
//                     appliance_list: function(callback) {
//                         Appliance.find({})
//                             .populate('qualifications')
//                             .exec(function(err, results) {
//                                 if (err) {
//                                     return next(err);
//                                 }
//                                 callback(null, results)
//                             });
//                     },
//                     firefighter_list: function(callback) {
//                         FireFighter.find({})
//                             .populate('qualifications')
//                             .sort('-rank number')
//                             .exec(function(err, results) {
//                                 if (err) {
//                                     return next(err);
//                                 }
//                                 callback(null, results)
//                             });

//                     }
//                 }, function(err, list_parallel) {
//                     if (err) {
//                         return next(err);
//                     }
//                     appliance_listing = list_parallel.appliance_list;
//                     firefighter_listing = list_parallel.firefighter_list;
//                     callback(null, list_parallel);
//                 });
//             },

//             rankings: function(callback) {
//                 async.parallel({
//                         flyer_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'flyer' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('flyer', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                     $match: {
//                                                         pump: pump._id
//                                                     }
//                                                 }, {
//                                                     $group: {
//                                                         _id: '$firefighter',
//                                                         count: {
//                                                             $sum: 1
//                                                         }
//                                                     }
//                                                 }, {
//                                                     $sort: {
//                                                         count: 1
//                                                     }
//                                                 }


//                                             ],
//                                             function(err, counts) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 FireFighter.populate(counts, {
//                                                     path: '_id'
//                                                 }, function(err, counts) {
//                                                     if (err) {
//                                                         return next(err);
//                                                     }

//                                                     callback(null, counts);
//                                                 });
//                                             });

//                                     },
//                                     function(callback) {
//                                         var flyer_array = []
//                                         async.mapValues(firefighter_listing, function (callback) {
//                                             flyer_array.push
//                                         }{

//                                             function(counts, callback) {
//                                                 var flyer_array = [];
//                                                 for (var i = 0; i < firefighter_listing.length; i++) {
//                                                     flyer_array.push(firefighter_listing[i]);
//                                                 }
//                                                 //find names with previous shift instance and move to end of list
//                                                 for (var i = 0; i < counts.length; i++) {
//                                                     for (var j = 0; j < flyer_array.length; j++) {
//                                                         if (flyer_array[j].name == counts[i]._id.name) {
//                                                             flyer_array.push(flyer_array.splice(j, 1)[0]);
//                                                         }

//                                                     }
//                                                 }
//                                                 callback(null, flyer_array);

//                                             }
//                                         })
//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 });
//                         },
//                         runner_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'runner' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('runner', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                     $match: {
//                                                         pump: pump._id
//                                                     }
//                                                 }, {
//                                                     $group: {
//                                                         _id: '$firefighter',
//                                                         count: {
//                                                             $sum: 1
//                                                         }
//                                                     }
//                                                 }, {
//                                                     $sort: {
//                                                         count: 1
//                                                     }
//                                                 }


//                                             ],
//                                             function(err, counts) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 FireFighter.populate(counts, {
//                                                     path: '_id'
//                                                 }, function(err, counts) {
//                                                     if (err) {
//                                                         return next(err);
//                                                     }

//                                                     callback(null, counts);
//                                                 });
//                                             });

//                                     },
//                                     function(counts, callback) {
//                                         var runner_array = [];
//                                         for (var i = 0; i < firefighter_listing.length; i++) {
//                                             runner_array.push(firefighter_listing[i]);
//                                         }
//                                         //find names with previous shift instance and move to end of list
//                                         for (var i = 0; i < counts.length; i++) {
//                                             for (var j = 0; j < runner_array.length; j++) {
//                                                 if (runner_array[j].name == counts[i]._id.name) {
//                                                     runner_array.push(runner_array.splice(j, 1)[0]);
//                                                 }

//                                             }
//                                         }
//                                         callback(null, runner_array);

//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 });
//                         },
//                         rescue_pump_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'rescuepump' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('rescuepump', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                     $match: {
//                                                         pump: pump._id
//                                                     }
//                                                 }, {
//                                                     $group: {
//                                                         _id: '$firefighter',
//                                                         count: {
//                                                             $sum: 1
//                                                         }
//                                                     }
//                                                 }, {
//                                                     $sort: {
//                                                         count: 1
//                                                     }
//                                                 }


//                                             ],
//                                             function(err, counts) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 FireFighter.populate(counts, {
//                                                     path: '_id'
//                                                 }, function(err, counts) {
//                                                     if (err) {
//                                                         return next(err);
//                                                     }

//                                                     callback(null, counts);
//                                                 });
//                                             });

//                                     },
//                                     function(counts, callback) {
//                                         var rescuepump_array = [];
//                                         for (var i = 0; i < firefighter_listing.length; i++) {
//                                             rescuepump_array.push(firefighter_listing[i]);
//                                         }
//                                         //find names with previous shift instance and move to end of list
//                                         for (var i = 0; i < counts.length; i++) {
//                                             for (var j = 0; j < rescuepump_array.length; j++) {
//                                                 if (rescuepump_array[j].name == counts[i]._id.name) {
//                                                     rescuepump_array.push(rescuepump_array.splice(j, 1)[0]);
//                                                 }

//                                             }
//                                         }
//                                         callback(null, rescuepump_array);

//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 });
//                         },
//                         salvage_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'salvage' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('salvage', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                     $match: {
//                                                         pump: pump._id
//                                                     }
//                                                 }, {
//                                                     $group: {
//                                                         _id: '$firefighter',
//                                                         count: {
//                                                             $sum: 1
//                                                         }
//                                                     }
//                                                 }, {
//                                                     $sort: {
//                                                         count: 1
//                                                     }
//                                                 }


//                                             ],
//                                             function(err, counts) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 FireFighter.populate(counts, {
//                                                     path: '_id'
//                                                 }, function(err, counts) {
//                                                     if (err) {
//                                                         return next(err);
//                                                     }

//                                                     callback(null, counts);
//                                                 });
//                                             });

//                                     },
//                                     function(counts, callback) {
//                                         var salvage_array = [];
//                                         for (var i = 0; i < firefighter_listing.length; i++) {
//                                             salvage_array.push(firefighter_listing[i]);
//                                         }
//                                         //find names with previous shift instance and move to end of list
//                                         for (var i = 0; i < counts.length; i++) {
//                                             for (var j = 0; j < salvage_array.length; j++) {
//                                                 if (salvage_array[j].name == counts[i]._id.name) {
//                                                     salvage_array.push(salvage_array.splice(j, 1)[0]);
//                                                 }

//                                             }
//                                         }
//                                         callback(null, salvage_array);

//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 });
//                         },
//                         bronto_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'bronto' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('bronto', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                     $match: {
//                                                         pump: pump._id
//                                                     }
//                                                 }, {
//                                                     $group: {
//                                                         _id: '$firefighter',
//                                                         count: {
//                                                             $sum: 1
//                                                         }
//                                                     }
//                                                 }, {
//                                                     $sort: {
//                                                         count: 1
//                                                     }
//                                                 }


//                                             ],
//                                             function(err, counts) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 FireFighter.populate(counts, {
//                                                     path: '_id'
//                                                 }, function(err, counts) {
//                                                     if (err) {
//                                                         return next(err);
//                                                     }

//                                                     callback(null, counts);
//                                                 });
//                                             });

//                                     },
//                                     function(counts, callback) {
//                                         var bronto_array = [];
//                                         for (var i = 0; i < firefighter_listing.length; i++) {
//                                             bronto_array.push(firefighter_listing[i]);
//                                         }
//                                         //find names with previous shift instance and move to end of list
//                                         for (var i = 0; i < counts.length; i++) {
//                                             for (var j = 0; j < bronto_array.length; j++) {
//                                                 if (bronto_array[j].name == counts[i]._id.name) {
//                                                     bronto_array.push(bronto_array.splice(j, 1)[0]);
//                                                 }

//                                             }
//                                         }
//                                         callback(null, bronto_array);

//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 });
//                         },
//                         md_rankings: function(callback) {
//                             async.waterfall([
//                                     function(callback) {
//                                         Appliance.findOne({ name: 'md' })
//                                             .exec(function(err, pump) {
//                                                 if (err) {
//                                                     return next(err);
//                                                 }
//                                                 callback(null, pump);
//                                             });
//                                         // ShiftInstance.findByName('md', function(err, pump) {
//                                         //     if (err) {
//                                         //         res.send(err);
//                                         //     }

//                                         //     callback(null, pump);
//                                         // });
//                                     },
//                                     function(pump, callback) {

//                                         ShiftInstance.aggregate([{
//                                                 $match: {
//                                                     md: true
//                                                 }
//                                             }, {
//                                                 $group: {
//                                                     _id: '$firefighter',
//                                                     count: {
//                                                         $sum: 1
//                                                     }
//                                                 }
//                                             }, {
//                                                 $sort: {
//                                                     count: 1
//                                                 }
//                                             }

//                                         ], function(err, counts) {
//                                             if (err) {
//                                                 return next(err);
//                                             }
//                                             FireFighter.populate(counts, {
//                                                 path: '_id'
//                                             }, function(err, counts) {

//                                                 if (err) {
//                                                     return next(err);
//                                                 }

//                                                 callback(null, counts);
//                                             });
//                                         });

//                                     },
//                                     function(counts, callback) {
//                                         var md_array = [];
//                                         for (var i = 0; i < firefighter_listing.length; i++) {
//                                             md_array.push(firefighter_listing[i]);
//                                         }
//                                         //find names with previous shift instance and move to end of list
//                                         for (var i = 0; i < counts.length; i++) {
//                                             for (var j = 0; j < md_array.length; j++) {
//                                                 if (md_array[j].name == counts[i]._id.name) {
//                                                     md_array.push(md_array.splice(j, 1)[0]);
//                                                 }

//                                             }
//                                         }
//                                         callback(null, md_array);

//                                     }
//                                 ],
//                                 function(err, newResult) {
//                                     if (err) {
//                                         return next(err);
//                                     } else {

//                                         callback(null, newResult);
//                                     }
//                                 })
//                         }
//                     },
//                     function(err, rankings_parallel) {

//                         callback(null, rankings_parallel);
//                     })
//             }
//         },
//         function(err, results) {
//             if (err) {
//                 return next(err);
//             }
//             console.log(results);
//             res.render('shiftinstance_form', {
//                 title: 'Shift create form',
//                 appliance_list: results.lists.appliance_list,
//                 flyer_list: results.rankings.flyer_rankings,
//                 runner_list: results.rankings.runner_rankings,
//                 rescue_pump_list: results.rankings.rescue_pump_rankings,
//                 salvage_list: results.rankings.salvage_rankings,
//                 bronto_list: results.rankings.bronto_rankings,
//                 md_list: results.rankings.md_rankings
//             });
//         });

//};











//console.log(results.)
// var flyer_array = [];
// var runner_array = [];
// var rescue_pump_array = [];
// var salvage_array = [];
// var bronto_array = [];
// var md_array = [];
// var total_array = [flyer_array, runner_array, rescue_pump_array, salvage_array, bronto_array];
// async.parallel([
//     async.eachOf(total_array, function(appliance, key, callback) {
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             appliance.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.flyer_rankings.length; i++) {
//             for (var j = 0; j < flyer_array.length; j++) {
//                 if (flyer_array[j].name == results.flyer_rankings[i]._id.name) {
//                     flyer_array.push(flyer_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     })

//     function(callback) { //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             flyer_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.flyer_rankings.length; i++) {
//             for (var j = 0; j < flyer_array.length; j++) {
//                 if (flyer_array[j].name == results.flyer_rankings[i]._id.name) {
//                     flyer_array.push(flyer_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     },
//     function(callback) { //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             runner_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.runner_rankings.length; i++) {
//             for (var j = 0; j < runner_array.length; j++) {
//                 if (runner_array[j].name == results.runner_rankings[i]._id.name) {
//                     runner_array.push(runner_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     },
//     function(callback) {
//         //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             rescue_pump_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.rescue_pump_rankings.length; i++) {
//             for (var j = 0; j < rescue_pump_array.length; j++) {
//                 if (rescue_pump_array[j].name == results.rescue_pump_rankings[i]._id.name) {
//                     rescue_pump_array.push(rescue_pump_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     },
//     function(callback) { //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             salvage_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.salvage_rankings.length; i++) {
//             for (var j = 0; j < salvage_array.length; j++) {
//                 if (salvage_array[j].name == results.salvage_rankings[i]._id.name) {
//                     salvage_array.push(salvage_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     },
//     function(callback) { //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             bronto_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.bronto_rankings.length; i++) {
//             for (var j = 0; j < bronto_array.length; j++) {
//                 if (bronto_array[j].name == results.bronto_rankings[i]._id.name) {
//                     bronto_array.push(bronto_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     },
//     function(callback) { //create an array from mongooose results
//         for (var i = 0; i < results.firefighter_list.length; i++) {
//             md_array.push(results.firefighter_list[i]);
//         }
//         //find names with previous shift instance and move to end of list
//         for (var i = 0; i < results.md_rankings.length; i++) {
//             for (var j = 0; j < md_array.length; j++) {
//                 if (md_array[j].name == results.md_rankings[i]._id.name) {
//                     md_array.push(md_array.splice(j, 1)[0]);
//                 }

//             }
//         }
//         callback();
//     }
// ]);





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
exports.shiftinstance_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get shiftInstance, firefighter for form
    async.parallel({
        firefighter_list: function(callback) {
            FireFighter.find(callback);
        },
        shift_list: function(callback) {
            async.waterfall([
                function(callback) {
                    ShiftInstance.findById(req.params.id)
                        .populate('firefighter')
                        .populate('pump')
                        .exec(function(err, fullshift) {
                            if (err) {
                                return next(err);
                            }
                            //console.log(fullshift)
                            callback(null, fullshift);
                        });
                },
                function(fullshift, callback) {
                    ShiftInstance.find({})
                        .where({
                            'pump': fullshift.pump._id
                        })
                        .where({
                            'date': fullshift.date
                        })
                        .where({
                            'shift': fullshift.shift
                        })
                        .populate('firefighter')
                        .exec(function(err, shift_list) {
                            if (err) {
                                return next(err);
                            }
                            console.log("Second waterfall");
                            callback(null, shift_list);
                        });
                }
            ], function(err, shift_list) {
                if (err) {
                    return next(err);
                }
                console.log('waterfall callback');
                callback(null, shift_list);
            });
        }

    }, function(err, results) {
        if (err) {
            console.log('error');
            return next(err);
        }
        console.log('parallel callback');
        var driver;
        var firefighters = [];
        
        async.each(results.shift_list, function (firefighter, callback) {
            if (firefighter.md == true){
                driver = firefighter;
            }
            else{
                firefighters.push(firefighter)
            }
            callback();
        })

        res.render('shiftinstanceOne_form', {
            title: 'Update ShiftInstance',
            firefighter_list: results.firefighter_list,
            driver_object: driver,
            back_list: firefighters
        });

    });
};

// Handle shiftinstance update on POST
exports.shiftinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance update POST');
};
