var Qualification = require('../models/qualification');

var async = require('async');

// Display list of all Qualifications
exports.qualification_list = function(req, res, next) {
    Qualification.find({})
        .exec(function (err, list_qualification) {
            if (err){ return next(err);}
            res.render('qualification_list', {title: 'Qualification List', list_qualification: list_qualification})
        })
};

// Display detail page for a specific Qualification
exports.qualification_detail = function(req, res, next) {
    Qualification.findById(req.params.id)
        .exec(function (err, qualification) {
            if (err) {
                return next(err);
            }
            res.render('qualification_detail', {title: "Detail", qualification: qualification});
        })
};

// Display Qualification create form on GET
exports.qualification_create_get = function(req, res, next) {
    res.render('qualification_form', {
        title: 'Create Qualification'
    })
};

// Handle Qualification create on POST
exports.qualification_create_post = function(req, res, next) {
    // check name field not empty
    req.checkBody('name', 'Qualification Name Required').notEmpty();

    //trim and escape name field
    req.sanitize('name').escape();
    req.sanitize('name').trim();

    //run validators
    var errors = req.validationErrors();

    //create qualification
    var qualification = new Qualification({
        name: req.body.name
    });

    if (errors) {
        //if there are errors render the form again, passing errors and qualification values
        for (var i = errors.length - 1; i >= 0; i--) {
            req.flash('errors', {msg: errors[i].msg})
        }
        res.render('qualification_form', {
            title: 'Create Qualification',
            qualification: qualification
        });
        return;
    }
    else {
        //data form is valid
        //check Qualification with same name already exists
        Qualification.findOne({
                'name': req.body.name
            })
            .exec(function(err, found_qualification) {
                console.log('found qualification: ' + found_qualification);
                if (err) {
                    return next(err);
                }
                if (found_qualification) {
                    //qualification already exists
                    res.redirect(found_qualification.url);
                }
                else {
                    qualification.save(function(err) {
                        if (err) {
                            return next(err);
                        }
                        //qualifiction saved
                        req.flash('success', {msg: 'Qualification Created Successfully'});
                        res.redirect(qualification.url)
                    });
                }
            });
    }

};

// Display Qualification delete form on GET
exports.qualification_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Qualification delete GET');
};

// Handle Qualification delete on POST
exports.qualification_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Qualification delete POST');
};

// Display Qualification update form on GET
exports.qualification_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Qualification update GET');
};

// Handle Qualification update on POST
exports.qualification_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Qualification update POST');
};
