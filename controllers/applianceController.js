var Appliance = require('../models/appliance');
var Qualification = require('../models/qualification');
var shared_methods = require('../shared_methods');

// Display list of all Appliances
exports.appliance_list = function(req, res, next) {
    shared_methods.appliance_find_all(function(results) {
        res.render('appliance_list', { title: 'Appliance List', appliance_list: results });
        })
};


// Display detail page for a specific Appliance
exports.appliance_detail = function(req, res, next) {
    shared_methods.appliance_findById(req.params.id, function(result) {
        res.render('appliance_detail', { title: 'Appliance Detail', appliance: result });
        });

};

// Display Appliance create form on GET
exports.appliance_create_get = function(req, res, next) {
    shared_methods.qualification_find_all(function (results) {
        res.render('appliance_form', { title: 'Create Appliance', qualification_list: results })
        })
};

// Handle Appliance create on POST
exports.appliance_create_post = function(req, res, next) {
    req.checkBody('name', 'Name must not be left blank').notEmpty();
    req.checkBody('seats', 'Seats must not be left blank').notEmpty();

    req.sanitize('name').escape();
    req.sanitize('seats').escape();
    req.sanitize('qualifications').escape();
    req.sanitize('name').trim();
    req.sanitize('seats').trim();
    req.sanitize('qualifications').trim();

    var appliance = new Appliance({
        name: req.body.name,
        seats: req.body.seats.split(","),
        qualifications: (typeof req.body.qualification === 'undefined') ? [] : req.body.qualification.split(",")
    })

    var errors = req.validationErrors();
    if (errors) {
        //some problems so form neads to be rerendered
        shared_methods.qualification_find_all(function (results) {
                //mark selected qualifications as checked
                for (i = 0; i < qualifications.length; i++) {
                    if (appliance.qualifications.indexOf(qualifications[i]._id > -1)) {
                        //Current qualifications is selected. Set 'checked' flag.
                        qualifications[i].checked = 'true';
                    }
                }
                res.render('appliance_form', { title: 'Create Appliance', qualification_list: results, appliance: appliance, errors: errors });
            });
    } else {
        //data from form is valid
        appliance.save(function(err) {
            if (err) {
                return next(err);
            }
            //redirect to new ff record
            req.flash('success', {msg: 'Appliance Created Successfully'});
            res.redirect(appliance.url);
        });
    }
};

// Display Appliance delete form on GET
exports.appliance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance delete GET');
};

// Handle Appliance delete on POST
exports.appliance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance delete POST');
};

// Display Appliance update form on GET
exports.appliance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance update GET');
};

// Handle Appliance update on POST
exports.appliance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance update POST');
};
