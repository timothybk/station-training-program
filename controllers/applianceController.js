var Appliance = require('../models/appliance');

// Display list of all Appliances
exports.appliance_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance list');
};

// Display detail page for a specific Appliance
exports.appliance_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance detail: ' + req.params.id);
};

// Display Appliance create form on GET
exports.appliance_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance create GET');
};

// Handle Appliance create on POST
exports.appliance_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Appliance create POST');
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