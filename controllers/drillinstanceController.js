var DrillInstance = require('../models/drillinstance');
var FireFighter = require('../models/firefighter');
var Drill = require('../models/drill');

var async = require('async');

// Display list of all DrillInstances
exports.drillinstance_list = function(req, res, next) {
    DrillInstance.find({})
        .populate('drill')
        .sort('-date')
        .exec(function(err, list_drillinstance) {
            if (err) {
                return next(err);
            }
            res.render('drillinstance_list', { title: 'Drill Instance List', drillinstance_list: list_drillinstance });
        })
};

// Display detail page for a specific DrillInstance
exports.drillinstance_detail = function(req, res, next) {
    DrillInstance.findById(req.params.id)
        .populate('firefighters')
        .populate('leader')
        .populate('drill')
        .exec(function(err, drillinstance) {
            if (err) {
                return next(err);
            }
            //success so render
            res.render('drillinstance_detail', { title: 'Drill Instance', drillinstance: drillinstance });
        });
};

// Display DrillInstance create form on GET
exports.drillinstance_create_get = function(req, res, next) {
    const promisea = FireFighter.find({})
        .exec();

    const promiseb = Drill.find({})
        .exec();

    Promise.all([promisea, promiseb])
        .then(function(values) {
            res.render('drillinstance_form', {
                title: 'Record Completed Drill',
                firefighter_list: values[0],
                drill_list: values[1]
            })
        })
        .catch(function(err){
            return next(err);
        })
}

//     async.parallel({
//         firefighter_list: function(callback) {
//             FireFighter.find({}, 'name rank number')
//                 .exec(callback);
//         },
//         drill_list: function(callback) {
//             Drill.find({}, 'name code')
//                 .exec(callback);
//         },
//     }, function(err, results) {
//         if (err) {
//             return next(err);
//         }
//         res.render('drillinstance_form', {
//             title: 'Record Completed Drill',
//             firefighter_list: results.firefighter_list,
//             drill_list: results.drill_list
//         });

//     })
// };

// Handle DrillInstance create on POST
exports.drillinstance_create_post = function(req, res, next) {

    req.checkBody('date', 'Invalid date').isDate();
    req.checkBody('leader', 'Leader must be specified').notEmpty();
    req.checkBody('drill', 'Drill must not be empty').notEmpty();
    req.checkBody('participant', 'participant must not be empty').notEmpty();

    req.sanitize('leader').escape();
    req.sanitize('drill').escape();
    req.sanitize('participant').escape();
    req.sanitize('leader').trim();
    req.sanitize('drill').trim();
    req.sanitize('participant').trim();

    //run validators
    var errors = req.validationErrors();

    var drillinstance = new DrillInstance({
        date: req.body.date,
        leader: req.body.leader,
        drill: req.body.drill,
        firefighters: (typeof req.body.participant === 'undefined') ? [] : req.body.participant.split(",")
    });

    if (errors) {
        //If there are errors render the form again, passing previously entered values and errors
        res.render('drillinstance_form', { title: 'Create Drillinstance', drillinstance: drillinstance, errors: errors });
        return;
    } else {
        //data form is valid
        //check Drillinstance with same name already exists

        drillinstance.save(function(err) {
            if (err) {
                return next(err);
            }
            //Drillinstance saved. Redirect to drillinstance detail page
            req.flash('success', { msg: 'Drill Record Created Successfully' });
            res.redirect(drillinstance.url);
        });

    }
};



// Display DrillInstance delete form on GET
exports.drillinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: DrillInstance delete GET');
};

// Handle DrillInstance delete on POST
exports.drillinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: DrillInstance delete POST');
};

// Display DrillInstance update form on GET
exports.drillinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: DrillInstance update GET');
};

// Handle drillinstance update on POST
exports.drillinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: DrillInstance update POST');
};
