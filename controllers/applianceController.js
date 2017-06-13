var Appliance = require('../models/appliance');
var Qualification = require('../models/qualification');

// Display list of all Appliances
exports.appliance_list = function(req, res, next) {
    Appliance.find({}, 'name qualifications')
        .populate('qualifications')
        .exec(function(err, list_appliance) {
            if (err) {
                return next(err);
            }
            res.render('appliance_list', { title: 'Appliance List', appliance_list: list_appliance });
        });
};


// Display detail page for a specific Appliance
exports.appliance_detail = function(req, res, next) {
    Appliance.findById(req.params.id)
        .populate('qualifications')
        .exec(function(err, appliance) {
            if (err) {
                return next(err);
            }
            res.render('appliance_detail', { title: 'Appliance Detail', appliance: appliance });
        });

};

// Display Appliance create form on GET
exports.appliance_create_get = function(req, res, next) {
    Qualification.find({}, 'name')
        .exec(function(err, qualifications) {
            if (err) {
                return next(err);
            }
            res.render('appliance_form', { title: 'Create Appliance', qualification_list: qualifications })
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
        Qualification.find({}, 'name')
            .exec(function(err, qualifications) {
                if (err) {
                    return next(err);
                }
                //mark selected qualifications as checked
                for (i = 0; i < qualifications.length; i++) {
                    if (appliance.qualifications.indexOf(qualifications[i]._id > -1)) {
                        //Current qualifications is selected. Set 'checked' flag.
                        qualifications[i].checked = 'true';
                    }
                }
                res.render('appliance_form', { title: 'Create Appliance', qualification_list: qualifications, appliance: appliance, errors: errors });
            });
    } else {
        //data from form is valid
        appliance.save(function(err) {
            if (err) {
                return next(err);
            }
            //redirect to new ff record
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
