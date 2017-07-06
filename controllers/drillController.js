var Drill = require('../models/drill');
var FireFighter = require('../models/firefighter');
var DrillInstance = require('../models/drillinstance');
var shared_methods = require('../shared_methods');

var async = require('async');

// Display list of all Drill
exports.drill_list = function(req, res, next) {
    shared_methods.drill_find_all(function (results) {
        res.render('drill_list', {title: 'Drill List', list_drills: results});
    });
};

// Display detail page for a specific Drill
exports.drill_detail = function(req, res, next) {
    
    async.parallel({
        drill: function(callback) {
            Drill.findById(req.params.id)
            .exec(callback);
        },

        drillinstance_list: function (callback) {
            DrillInstance.find({'drill': req.params.id})
            .populate('firefighters')
            .sort('-date')
            .exec(callback);
        },
    }, function (err, results) {
        if (err) {return next(err);}
        res.render('drill_detail', {title: 'Drill Detail', drill: results.drill, drillinstance_list: results.drillinstance_list});
    });
};

// Display Drill create form on GET
exports.drill_create_get = function(req, res, next) {
    res.render('drill_form', { title: 'Create Drill' });
};

// Handle Drill create on POST
exports.drill_create_post = function(req, res, next) {

    //check that the field is not empty
    req.checkBody('name', 'Drill name required').notEmpty();

    //trim and escape the field
    req.sanitize('name').escape();
    req.sanitize('code').escape();
    req.sanitize('name').trim();
    req.sanitize('name').trim();

    //run the validators
    var errors = req.validationErrors();

    //Create a drill object with escaped and trimmed data
    var drill = new Drill({
    	code: req.body.code,
        name: req.body.name
    });

    if (errors) {
        //If there are errors render the form again, passing previously entered values and errors
        res.render('drill_form', { title: 'Create Drill', drill: drill, errors: errors });
        return;
    } else {
        //data form is valid
        //check Drill with same name already exists
        Drill.findOne({ 'name': req.body.name })
            .exec(function(err, found_drill) {
                console.log('found_drill: ' + found_drill);
                if (err) {
                    return next(err); }

                if (found_drill) {
                    //Drill exists, redirect to detail page
                    res.redirect(found_drill.url);
                } else {
                    drill.save(function(err) {
                        if (err) {
                            return next(err); }
                        //Drill saved. Redirect to drill detail page
                        req.flash('success', {msg: 'Drill Created Successfully'});
                        res.redirect(drill.url);
                    });
                }
            });
    }
};

// Display Drill delete form on GET
exports.drill_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Drill delete GET');
};

// Handle Drill delete on POST
exports.drill_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Drill delete POST');
};

// Display Drill update form on GET
exports.drill_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Drill update GET');
};

// Handle Drill update on POST
exports.drill_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Drill update POST');
};