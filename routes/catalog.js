var express = require('express');
var router = express.Router();

// Require controller modules
var firefighter_controller = require('../controllers/firefighterController');
var drill_controller = require('../controllers/drillController');
var drillinstance_controller = require('../controllers/drillinstanceController');


/// FIREFIGHTER ROUTES ///

/* GET catalog home page. */
router.get('/', firefighter_controller.index);

/*GET request for creating a ff*/
router.get('/firefighter/create', firefighter_controller.firefighter_create_get);

//POST request for creating firefighter
router.post('/firefighter/create', firefighter_controller.firefighter_create_post);

//GET request to delete firefighter
router.get('/firefighter/:id/delete', firefighter_controller.firefighter_delete_get);

//POST request to delete firefighter
router.post('/firefighter/:id/delete', firefighter_controller.firefighter_delete_post);

//GET request to update firefighter
router.get('/firefighter/:id/update', firefighter_controller.firefighter_update_get);

//POST request to update firefighter
router.post('/firefighter/:id/update', firefighter_controller.firefighter_update_post);

//GET request for one firefighter
router.get('/firefighter/:id', firefighter_controller.firefighter_detail);

//GET request to list all firefighters
router.get('/firefighters', firefighter_controller.firefighter_list);

/// DRILL ROUTES ///

/*GET request for creating a ff*/
router.get('/drill/create', drill_controller.drill_create_get);

//POST request for creating drill
router.post('/drill/create', drill_controller.drill_create_post);

//GET request to delete drill
router.get('/drill/:id/delete', drill_controller.drill_delete_get);

//POST request to delete drill
router.post('/drill/:id/delete', drill_controller.drill_delete_post);

//GET request to update drill
router.get('/drill/:id/update', drill_controller.drill_update_get);

//POST request to update drill
router.post('/drill/:id/update', drill_controller.drill_update_post);

//GET request for one drill
router.get('/drill/:id', drill_controller.drill_detail);

//GET request to list all drills
router.get('/drills', drill_controller.drill_list);

/// DRILLINSTANCE ROUTES ///

/*GET request for creating a ff*/
router.get('/drillinstance/create', drillinstance_controller.drillinstance_create_get);

//POST request for creating drillinstance
router.post('/drillinstance/create', drillinstance_controller.drillinstance_create_post);

//GET request to delete drillinstance
router.get('/drillinstance/:id/delete', drillinstance_controller.drillinstance_delete_get);

//POST request to delete drillinstance
router.post('/drillinstance/:id/delete', drillinstance_controller.drillinstance_delete_post);

//GET request to update drillinstance
router.get('/drillinstance/:id/update', drillinstance_controller.drillinstance_update_get);

//POST request to update drillinstance
router.post('/drillinstance/:id/update', drillinstance_controller.drillinstance_update_post);

//GET request for one drillinstance
router.get('/drillinstance/:id', drillinstance_controller.drillinstance_detail);

//GET request to list all drillinstances
router.get('/drillinstances', drillinstance_controller.drillinstance_list);

module.exports = router;