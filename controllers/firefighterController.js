var FireFighter = require('../models/firefighter');
var Drill = require('../models/drill');
var DrillInstance = require('../models/drillinstance');
var Qualification = require('../models/qualification');
var ShiftInstance = require('../models/shiftinstance');
var shared_methods = require('../shared_methods');

var async = require('async');

exports.index = function(req, res) {
    async.parallel({
        firefighter_count: function(callback) {
            FireFighter.count(callback);
        },
        drill_count: function(callback) {
            Drill.count(callback);
        },
        drillinstance_count: function(callback) {
            DrillInstance.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Drill Reporting Home', error: err, data: results });
    });
};

// Display list of all firefighters
exports.firefighter_list = function(req, res, next) {

    FireFighter.find({}, 'name rank number')
        .sort('-rank _id')
        .exec(function(err, list_firefighter) {
            if (err) {
                return next(err);
            }
            res.render('firefighter_list', { title: 'FireFighter List', firefighter_list: list_firefighter });
        });
};

// Display detail page for a specific firefighter
exports.firefighter_detail = function(req, res, next) {

    const promiseA = FireFighter.findById(req.params.id)
        .populate('qualifications')
        .populate('drills')
        .exec();

    const promiseB = DrillInstance.find({'firefighters': req.param.id})
        .populate('drill')
        .populate('leader')
        .sort('-date')
        .exec();

    const promiseC = ShiftInstance.find({'firefighter': req.params.id})
        .populate('pump')
        .sort('-date')
        .exec();

    Promise.all([promiseA, promiseB, promiseC])
        .then((results) => {
            res.render('firefighter_detail', {
                title: 'FireFighter',
                firefighter: results[0],
                drillinstance_list: results[1],
                shiftinstance_list: results[2]
            })
        })



    // async.parallel({
    //         firefighter: function(callback) {

    //             FireFighter.findById(req.params.id)
    //                 .populate('qualifications')
    //                 .populate('drills')
    //                 .exec(callback);
    //         },

    //         drillinstance_list: function(callback) {
    //             DrillInstance.find({ 'firefighters': req.params.id }, 'drill leader date')
    //                 .populate('drill')
    //                 .populate('leader')
    //                 .sort('-date')
    //                 .exec(callback);
    //         },

    //         shiftinstance_list: function(callback) {
    //             ShiftInstance.find({ 'firefighter': req.params.id })
    //                 .populate('pump')
    //                 .sort('-date')
    //                 .exec(callback);
    //         },
    //     }, function(err, results) {
    //         if (err) {

    //             return next(err);
    //         }

    //     res.render('firefighter_detail', {
    //         title: 'FireFighter',
    //         firefighter: results.firefighter,
    //         drillinstance_list: results.drillinstance_list,
    //         shiftinstance_list: results.shiftinstance_list
    //     });

    // });
}

// Display firefighter drill record in FRNSW format
exports.firefighter_drill_record = function(req, res, next) {
    shared_methods.firefighter_find_all_drills(req.params.id, function(results) {
        res.render('firefighter_drill_record', {
            title: 'FireFighter',
            firefighter: results.firefighter,
            drillinstance_list: results.drillinstance_list,
            shiftinstance_list: results.shiftinstance_list
        });

    });
};

// Display firefighter create form on GET
exports.firefighter_create_get = function(req, res, next) {
    Qualification.find({}, 'name')
        .exec(function(err, qualifications) {
            if (err) {
                return next(err);
            }

            res.render('firefighter_form', { title: 'Create FireFighter', qualification_list: qualifications });
        })
};

// Handle firefighter create on POST
exports.firefighter_create_post = function(req, res, next) {

    req.checkBody('number', 'Number must not be empty.').notEmpty();
    req.checkBody('rank', 'Rank must not be empty.').notEmpty();
    req.checkBody('name', 'Name must not be empty.').notEmpty();

    req.sanitize('number').escape();
    req.sanitize('rank').escape();
    req.sanitize('name').escape();
    req.sanitize('number').trim();
    req.sanitize('rank').trim();
    req.sanitize('name').trim();
    req.sanitize('qualification').escape();


    var firefighter = new FireFighter({
        number: req.body.number,
        rank: req.body.rank,
        name: req.body.name,
        qualifications: (typeof req.body.qualification === 'undefined') ? [] : req.body.qualification.split(",")
    });

    console.log('FIREFIGHTER: ' + firefighter);

    var errors = req.validationErrors();
    if (errors) {
        //some problems so form neads to be rerendered
        Qualification.find({}, 'name')
            .exec(function(err, qualifications) {
                if (err) {
                    return next(err);
                }
                //mark selected qualifications as checked
                for (var i = 0; i < qualifications.length; i++) {
                    if (firefighter.qualifications.indexOf(qualifications[i]._id > -1)) {
                        //Current qualifications is selected. Set 'checked' flag.
                        qualifications[i].checked = 'true';
                    }
                }
                for (var i = errors.length - 1; i >= 0; i--) {
                            req.flash('errors', {msg: errors[i].msg})
                        }
                res.render('firefighter_form', { title: 'Create FireFighter', qualification_list: qualifications, firefighter: firefighter});
            });
    } else {
        //data from form is valid
        FireFighter.findOne({ 'number': req.body.number })
            .exec(function(err, found_firefighter) {
                console.log('found_firefighter: ' + found_firefighter);
                if (err) {
                    return next(err);
                }
                if (found_firefighter) {
                    //FireFighter exists, redirect to detail page
                    res.redirect(found_firefighter.url);
                } else {
                    firefighter.save(function(err) {
                        if (err) {
                            return next(err);
                        }
                        //redirect to new ff record
                        req.flash('success', {msg: 'FireFighter Created Successfully'});
                        res.redirect(firefighter.url);
                    });
                }
            });
    }
};

// Display firefighter delete form on GET
exports.firefighter_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: FireFighter delete GET');
};

// Handle firefighter delete on POST
exports.firefighter_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: FireFighter delete POST');
};

// Display firefighter update form on GET
exports.firefighter_update_get = function(req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Get firefighters, qualifications for form
    async.parallel({
        firefighter: function(callback) {
            FireFighter.findById(req.params.id)
                .populate('qualifications')
                .exec(callback);
        },
        qualifications: function(callback) {
            Qualification.find(callback);
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        //Mark selected qualifications as checked
        for (var all_q_iter = 0; all_q_iter < results.qualifications.length; all_q_iter++) {
            for (var ff_q_iter = 0; ff_q_iter < results.firefighter.qualifications.length; ff_q_iter++) {
                if (results.qualifications[all_q_iter]._id.toString() == results.firefighter.qualifications[ff_q_iter]._id.toString()) {
                    results.qualifications[all_q_iter].checked = 'true';
                }
            }
        }
        res.render('firefighter_form', {
            title: 'Update FireFighter',
            firefighter: results.firefighter,
            qualification_list: results.qualifications
        })
    });

};

// Handle firefighter update on POST
exports.firefighter_update_post = function(req, res, next) {
    //sanitize id passed in
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    //Check other data
    req.checkBody('number', 'Number must not be empty.').notEmpty();
    req.checkBody('rank', 'Rank must not be empty.').notEmpty();
    req.checkBody('name', 'Name must not be empty.').notEmpty();

    req.sanitize('number').escape();
    req.sanitize('rank').escape();
    req.sanitize('name').escape();
    req.sanitize('number').trim();
    req.sanitize('rank').trim();
    req.sanitize('name').trim();
    req.sanitize('qualification').escape();

    var firefighter = new FireFighter({
        number: req.body.number,
        rank: req.body.rank,
        name: req.body.name,
        qualifications: (typeof req.body.qualification === 'undefined') ? [] : req.body.qualification.split(","),
        _id: req.params.id //stop a new id being assigned
    });

    var errors = req.validationErrors();
    if (errors) {
        //rerender ff with error info
        //get all quals for form
        Qualification.find({}, 'name')
            .exec(function(err, qualifications) {
                if (err) {
                    return next(err);
                }
                //mark selected qualifications as checked
                for (var i = 0; i < qualifications.length; i++) {
                    if (firefighter.qualifications.indexOf(qualifications[i]._id > -1)) {
                        //Current qualifications is selected. Set 'checked' flag.
                        qualifications[i].checked = 'true';
                    }
                }
                res.render('firefighter_form', { title: 'Create FireFighter', qualification_list: qualifications, firefighter: firefighter, errors: errors });
            });
    } else {
        //data from form is valid. update record
        FireFighter.findByIdAndUpdate(req.params.id, firefighter, {}, function(err, thefirefighter) {
            if (err) {
                return next(err);
            }
            //successfull -redirect to firefighter detail
            res.redirect(thefirefighter.url);
        });
    }
};
