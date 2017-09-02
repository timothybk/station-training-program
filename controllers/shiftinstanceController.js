var ShiftInstance = require('../models/shiftinstance');
var FireFighter = require('../models/firefighter');
var Appliance = require('../models/appliance');
var Qualification = require('../models/qualification');
var ShiftInstance = require('../models/shiftinstance');

var async = require('async');
const _ = require('lodash');

// Display list of all ShifTinstances
exports.shiftinstance_list = function (req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance list');
};

// Display detail page for a specific ShiftInstance
exports.shiftinstance_detail = function (req, res, next) {
    ShiftInstance.findById(req.params.id)
        .populate('firefighter')
        .populate('pump')
        .exec(function (err, result) {
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

//display ShiftInstance landing on get
exports.shiftinstance_landing_get = function (req, res, next) {
    FireFighter.find({})
        .then((result) => {
            let sortResult = result.sort((a, b) => {
                return a.number - b.number;
            })
            res.render('shiftinstance_landing', {
                title: 'Landing',
                firefighter_list: sortResult
            });
        })
        .catch(err =>{
            return next (err);
        })
}

//handle ShiftInstance landing on post
exports.shiftinstance_landing_post = function (req, res, next) {
        req.sanitize('firefighters').escape();
        req.sanitize('firefighters').trim();
        res.redirect('create/?valid=' + req.body.firefighters);
}

//Display ShiftInstance create form on GET
exports.shiftinstance_create_get = function (req, res, next) {
    //const firefighters = req.query.valid.split(',');    
    const promiseA = FireFighter.find({})
        .populate('qualifications')
        .exec()

    const promiseB = Appliance.find({})
        .populate('qualifications')
        .exec()

    Promise.all([promiseA, promiseB])
        .then(([firefighters, appliances]) => {
            return Promise.all(firefighters.map((firefighter) => {
                return ShiftInstance.aggregate()
                    .match({ 'firefighter': firefighter._id })
                    .lookup({ from: 'firefighters', localField: 'firefighter', foreignField: '_id', as: 'firefighter' })
                    .unwind('$firefighter')
                    .lookup({ from: 'appliances', localField: 'pump', foreignField: '_id', as: 'pump' })
                    .unwind('$pump')
                    .group({ _id: { pump: '$pump.name', md: '$md' }, count: { $sum: 1 } })
                    .sort('count')
                    .then(result => {
                        const pumps = {};

                        for (let pump of appliances) {
                            pumps[pump.name] = {};
                            const record = result.find(truck => {
                                return truck._id.pump === pump.name && truck._id.md === false;
                            })
                            const recordMd = result.find(truck => {
                                return truck._id.pump === pump.name && truck._id.md === true;
                            })
                            let nonMd;
                            let md;
                            if (record) {
                                nonMd = record.count;
                            } else {
                                nonMd = 0;
                            }

                            if (recordMd) {
                                md = recordMd.count
                            } else {
                                md = 0
                            }
                            pumps[pump.name].driver = md;
                            pumps[pump.name].back = nonMd;

                        }
                        let sum = 0;
                        for (var key in pumps) {
                            for (var pos in key) {
                                if (key.hasOwnProperty(pos)) {
                                    sum += key[pos];

                                }
                            }
                        }
                        pumps.total = sum;
                        pumps.avg = Math.round(pumps.total / appliances.length);
                        return pumps;
                    })
            }))
                .then(result => {
                    const pumpObj = {};

                    for (let pump of appliances) {
                        const ffBackMain = [];
                        const ffBackSecond = [];
                        const ffDriverMain = [];
                        const ffDriverSecond = [];
                        const pumpQual = [];
                        // set Appliance.name as a key in pumpObj;
                        pumpObj[pump.name] = {};
                        // set 'appliance' as key, Appliance as value
                        pumpObj[pump.name].appliance = pump;
                        // populate pumpQual with pump qualification names
                        if (pump.qualifications.length > 0) {
                            for (let qual of pump.qualifications) {
                                pumpQual.push(qual.name);
                            }
                        }
                        for (var i = 0; i < result.length; i++) {
                            const ffQual = [];
                            if (firefighters[i].qualifications.length > 0) {
                                for (let qual of firefighters[i].qualifications) {
                                    ffQual.push(qual.name);
                                }
                            }
                            // remove station officers and push [FireFighter Object, count for this pump] to array
                            
                            switch (true) {
                                case firefighters[i].rank === 'Station Officer':
                                    break;
                                case firefighters[i].name === 'dummy':
                                    ffBackSecond.push([firefighters[i], result[i][pump.name].back]);
                                    ffDriverSecond.push([firefighters[i], result[i][pump.name].driver]);
                                    break;
                                case pumpQual.length > 0 && pumpQual.some(v => ffQual.includes(v)):
                                    ffBackMain.push([firefighters[i], result[i][pump.name].back]);
                                    ffDriverMain.push([firefighters[i], result[i][pump.name].driver]);
                                    break;
                                case pumpQual.length > 0 && ffQual.includes('md') && pump.name === 'rescuepump':
                                    ffDriverMain.push([firefighters[i], result[i][pump.name].driver]);
                                    ffBackSecond.push([firefighters[i], result[i][pump.name].back])
                                    break;
                                case pumpQual.length > 0:
                                    ffDriverSecond.push([firefighters[i], result[i][pump.name].driver]);
                                    ffBackSecond.push([firefighters[i], result[i][pump.name].back]);
                                    break;
                                case pumpQual.length <= 0 && ffQual.includes('md'):
                                    ffBackMain.push([firefighters[i], result[i][pump.name].back]);
                                    ffDriverMain.push([firefighters[i], result[i][pump.name].driver]);
                                    break;
                                default:
                                    ffBackMain.push([firefighters[i], result[i][pump.name].back]);
                                    ffDriverSecond.push([firefighters[i], result[i][pump.name].driver])
                                    break;
                            }
                        }
                        // sort array of [Firefighter Object, count] (ascending)
                        ffBackMain.sort((a, b) => {
                            return a[1] - b[1];
                        })
                        ffBackSecond.sort((a, b) => {
                            return a[1] - b[1];
                        })
                        ffDriverMain.sort((a, b) => {
                            return a[1] - b[1];
                        })
                        ffDriverSecond.sort((a, b) => {
                            return a[1] - b[1];
                        })
                        for (var i = 0; i < pump.seats.length; i++) {
                            ffBackMain[i]['selected' + (i + 1)] = true;                          
                        }
                        // set 'results' as key and array of [Firefighter Object, count] as value
                        pumpObj[pump.name].backMain = ffBackMain;
                        pumpObj[pump.name].backSecond = ffBackSecond;
                        pumpObj[pump.name].driverMain = ffDriverMain;                        
                        pumpObj[pump.name].driverSecond = ffDriverSecond;


                    }

                    return pumpObj;
                })
        })
        .then(result => {
            res.render('shiftinstance_form', {
                title: 'shift form',
                results: result
            })
        })
        .catch(err => {
            return next(err);
        })



}

//     
// Handle ShiftInstance create on POST
exports.shiftinstance_create_post = function (req, res, next) {
    var appliance_arr = [];
    var shiftinstance_array = [];

    Appliance.find({}, 'name seats')
        .then((result) => {
            appliance_arr = result;


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
                    .then((firefighters) => {
                        //successful so render
                        for (var i = errors.length - 1; i >= 0; i--) {
                            req.flash('errors', { msg: errors[i].msg })
                        }
                        //currently redirecting to create_get and losing user input                        
                        res.redirect('create');
                    });
            } else {

                Promise.all(shiftinstance_array.map((shiftinstance) => {
                    shiftinstance.save();
                }))
                    .then(() => {
                        req.flash('success', { msg: 'Shift created successfully' });
                        res.redirect('create');
                    })


            }

        })
        .catch((err) => {
            if (err) {
                return next(err);
            }
        })
}


// Display ShiftInstance delete form on GET
exports.shiftinstance_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance delete GET');
};

// Handle ShiftInstance delete on POST
exports.shiftinstance_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: ShifTinstance delete POST');
};

// Display ShiftInstance update form on GET
exports.shiftinstance_update_get = function (req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get shiftInstance, firefighter for form
    async.parallel({
        firefighter_list: function (callback) {
            FireFighter.find(callback);
        },
        current_shiftinstance: function (callback) {
            ShiftInstance.findById(req.params.id)
                .populate('firefighter')
                .populate('pump')
                .exec(callback);
        }
    }, function (err, results) {
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
exports.shiftinstance_update_post = function (req, res, next) {
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
            .exec(function (err, firefighter_list) {
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
        }, {}, function (err, theshiftinstance) {
            if (err) {
                return next(err);
            }
            //successfull -redirect to firefighter detail
            res.redirect(theshiftinstance.url);
        });
    }


};