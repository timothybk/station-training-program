var FireFighter = require('../models/firefighter');
var Drill = require('../models/drill');
var DrillInstance = require('../models/drillinstance');

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
        //.populate('qualifications')
        .exec(function(err, list_firefighter) {
            if (err) {
                return next(err);
            }
            res.render('firefighter_list', { title: 'FireFighter List', firefighter_list: list_firefighter });
        });
};

// Display detail page for a specific firefighter
exports.firefighter_detail = function(req, res, next) {

    async.parallel({
        firefighter: function(callback) {

            FireFighter.findById(req.params.id)
                .populate('drills')
                .exec(callback);
        },

        drillinstance_list: function(callback) {
            DrillInstance.find({ 'firefighters': req.params.id }, 'drill date')
                .populate('drill')
                .sort('-date')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) {
            return next(err);
        }
        res.render('firefighter_detail', { title: 'FireFighter', firefighter: results.firefighter, drillinstance_list: results.drillinstance_list });
    })

};

// Display firefighter create form on GET
exports.firefighter_create_get = function(req, res, next) {
    res.render('firefighter_form', { title: 'Create FireFighter' });

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


    var firefighter = new FireFighter({
        number: req.body.number,
        rank: req.body.rank,
        name: req.body.name,
        drills: []
    });

    console.log('FIREFIGHTER: ' + firefighter);

    var errors = req.validationErrors();
    if (errors) {
        //some problems so form neads to be rerendered

        res.render('firefighter_form', { title: 'Create FireFighter', firefighter: firefighter, errors: errors });
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
    // req.sanitize('id').escape();
    // req
};

// Handle firefighter update on POST
exports.firefighter_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: FireFighter update POST');
};
