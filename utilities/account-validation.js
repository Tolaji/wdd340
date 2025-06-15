const utilities = require('.');
const { body, validationResult } = require('express-validator');
const validate = {};
const accountModel = require("../models/account-model");
const { check } = require("express-validator");

// 🔐 Reusable strong password validation rule
const passwordValidationRule = () => {
  return body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be at least 12 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
};


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
    passwordValidationRule(),
];
};

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
    
    passwordValidationRule(),
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

// Update Account Rules
validate.updateAccountRules = () => {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email").trim().isEmail().withMessage("Valid email required.")
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email);
        if (account && account.account_id != req.body.account_id) {
          throw new Error("Email already in use.");
        }
      }),
  ];
};

validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      formData: req.body,
    });
  }
  next();
};

// Password Rules
validate.updatePasswordRules = () => {
  return [
    passwordValidationRule(),
  ];
};

validate.checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      formData: req.body,
    });
  }
  next();
};


module.exports = validate;
