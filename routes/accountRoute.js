// Import required modules
const express = require('express');
const router = express.Router();
const { handleErrors } = require('../utilities/errorHandler');
const utilities = require('../utilities/index');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');

// LOGIN & REGISTER ROUTES
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get('/register', utilities.handleErrors(accountController.buildRegister));
router.post('/register',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
router.post('/login',
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// DASHBOARD ROUTE
router.get("/",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

// ✅ LOGOUT ROUTE (TASK 6)
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
});

// ✅ ACCOUNT UPDATE VIEW (TASK 4)
router.get("/update/:account_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// ✅ UPDATE ACCOUNT INFO (TASK 5)
router.post("/update/account",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
);

// ✅ UPDATE PASSWORD (TASK 5)
router.post("/update/password",
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Export router
module.exports = router;
