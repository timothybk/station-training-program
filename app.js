/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const firefighter_controller = require('./controllers/firefighterController');
const drill_controller = require('./controllers/drillController');
const drillinstance_controller = require('./controllers/drillinstanceController');
const appliance_controller = require("./controllers/applianceController");
const qualification_controller = require("./controllers/qualificationController");
const shiftinstance_controller = require('./controllers/shiftinstanceController');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
/**
* STP specific routes
*/
/// FIREFIGHTER ROUTES ///

/* GET catalog home page. */
//app.get('/', firefighter_controller.index);

/*GET request for creating a ff*/
app.get('/firefighter/create', firefighter_controller.firefighter_create_get);

//POST request for creating firefighter
app.post('/firefighter/create', firefighter_controller.firefighter_create_post);

//GET request to delete firefighter
app.get('/firefighter/:id/delete', firefighter_controller.firefighter_delete_get);

//POST request to delete firefighter
app.post('/firefighter/:id/delete', firefighter_controller.firefighter_delete_post);

//GET request to update firefighter
app.get('/firefighter/:id/update', firefighter_controller.firefighter_update_get);

//POST request to update firefighter
app.post('/firefighter/:id/update', firefighter_controller.firefighter_update_post);

//GET request for one firefighter
app.get('/firefighter/:id', firefighter_controller.firefighter_detail);

//GET request to list all firefighters
app.get('/firefighters', firefighter_controller.firefighter_list);

/// DRILL ROUTES ///

/*GET request for creating a ff*/
app.get('/drill/create', drill_controller.drill_create_get);

//POST request for creating drill
app.post('/drill/create', drill_controller.drill_create_post);

//GET request to delete drill
app.get('/drill/:id/delete', drill_controller.drill_delete_get);

//POST request to delete drill
app.post('/drill/:id/delete', drill_controller.drill_delete_post);

//GET request to update drill
app.get('/drill/:id/update', drill_controller.drill_update_get);

//POST request to update drill
app.post('/drill/:id/update', drill_controller.drill_update_post);

//GET request for one drill
app.get('/drill/:id', drill_controller.drill_detail);

//GET request to list all drills
app.get('/drills', drill_controller.drill_list);

/// DRILLINSTANCE ROUTES ///

/*GET request for creating a ff*/
app.get('/drillinstance/create', drillinstance_controller.drillinstance_create_get);

//POST request for creating drillinstance
app.post('/drillinstance/create', drillinstance_controller.drillinstance_create_post);

//GET request to delete drillinstance
app.get('/drillinstance/:id/delete', drillinstance_controller.drillinstance_delete_get);

//POST request to delete drillinstance
app.post('/drillinstance/:id/delete', drillinstance_controller.drillinstance_delete_post);

//GET request to update drillinstance
app.get('/drillinstance/:id/update', drillinstance_controller.drillinstance_update_get);

//POST request to update drillinstance
app.post('/drillinstance/:id/update', drillinstance_controller.drillinstance_update_post);

//GET request for one drillinstance
app.get('/drillinstance/:id', drillinstance_controller.drillinstance_detail);

//GET request to list all drillinstances
app.get('/drillinstances', drillinstance_controller.drillinstance_list);

/// APPLIANCE ROUTES ///

/*GET request for creating a ff*/
app.get('/appliance/create', appliance_controller.appliance_create_get);

//POST request for creating appliance
app.post('/appliance/create', appliance_controller.appliance_create_post);

//GET request to delete appliance
app.get('/appliance/:id/delete', appliance_controller.appliance_delete_get);

//POST request to delete appliance
app.post('/appliance/:id/delete', appliance_controller.appliance_delete_post);

//GET request to update appliance
app.get('/appliance/:id/update', appliance_controller.appliance_update_get);

//POST request to update appliance
app.post('/appliance/:id/update', appliance_controller.appliance_update_post);

//GET request for one appliance
app.get('/appliance/:id', appliance_controller.appliance_detail);

//GET request to list all appliances
app.get('/appliances', appliance_controller.appliance_list);

/// QUALIFICATION ROUTES ///

/*GET request for creating a ff*/
app.get('/qualification/create', qualification_controller.qualification_create_get);

//POST request for creating qualification
app.post('/qualification/create', qualification_controller.qualification_create_post);

//GET request to delete qualification
app.get('/qualification/:id/delete', qualification_controller.qualification_delete_get);

//POST request to delete qualification
app.post('/qualification/:id/delete', qualification_controller.qualification_delete_post);

//GET request to update qualification
app.get('/qualification/:id/update', qualification_controller.qualification_update_get);

//POST request to update qualification
app.post('/qualification/:id/update', qualification_controller.qualification_update_post);

//GET request for one qualification
app.get('/qualification/:id', qualification_controller.qualification_detail);

//GET request to list all qualifications
app.get('/qualifications', qualification_controller.qualification_list);

/// SHIFTINSTANCE ROUTES ///

/*GET request for creating a ff*/
app.get('/shiftinstance/create', shiftinstance_controller.shiftinstance_create_get);

//POST request for creating shiftinstance
app.post('/shiftinstance/create', shiftinstance_controller.shiftinstance_create_post);

//GET request to delete shiftinstance
app.get('/shiftinstance/:id/delete', shiftinstance_controller.shiftinstance_delete_get);

//POST request to delete shiftinstance
app.post('/shiftinstance/:id/delete', shiftinstance_controller.shiftinstance_delete_post);

//GET request to update shiftinstance
app.get('/shiftinstance/:id/update', shiftinstance_controller.shiftinstance_update_get);

//POST request to update shiftinstance
app.post('/shiftinstance/:id/update', shiftinstance_controller.shiftinstance_update_post);

//GET request for one shiftinstance
app.get('/shiftinstance/:id', shiftinstance_controller.shiftinstance_detail);

//GET request to list all shiftinstances
app.get('/shiftinstances', shiftinstance_controller.shiftinstance_list);


/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/lob', apiController.getLob);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/api/google-maps', apiController.getGoogleMaps);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), (req, res) => {
  res.redirect('/api/tumblr');
});
app.get('/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/api/pinterest');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
