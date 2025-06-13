// Import required modules
const express = require('express');
const router = express.Router();
const { handleErrors } = require('../utilities/errorHandler');
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

// Route for login view when "My Account" is clicked
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Route for register view when "register" is clicked
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Process the registration form submission
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Process the login form submission
router.post('/login', regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));

router.get("/", utilities.checkJWTToken, utilities.handleErrors(accountController.buildAccount));


// Export the router to be used in server.js
module.exports = router;
