const utilities = require('.');
const { body, validationResult } = require('express-validator');
const validate = {};
const accountModel = require("../models/account-model");
const { check } = require("express-validator");

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
return [
    // firstname is required and must be string
    body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),

    // password is required and must be strong password
    body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]
}

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkRegData = async (req, res, next) => {
const { account_firstname, account_lastname, account_email } = req.body
const errors = validationResult(req)
if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
    errors,
    title: "Registration",
    nav,
    formData: {
        account_firstname,
        account_lastname,
        account_email,
    },
    })
    return
}

// ✅ Always pass errors to the view later even if empty
req.errors = errors
next()
}

/* ***************************
 * Login Validation Rules
 * ***************************/
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please enter your email.")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email format."),
    
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please enter your password.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ***************************
 * Login Data Check Middleware
 * ***************************/
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  const { account_email } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      notice: null,
      formData: { account_email } // Repopulate field
    });
    return;
  }

  next();
};

module.exports = validate;
