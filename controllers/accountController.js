const utilities = require('../utilities/index');
const accountModel = require('../models/account-model');
// const bcrypt = require("bcrypt");
const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/;



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    notice: req.flash('notice'),
    error: req.flash('error'),
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      formData: {}, // prevent undefined
      errors: { array: () => [] } // <-- this prevents `.array()` crash
    });
  } catch (error) {
    console.error("Error rendering register:", error);
    res.status(500).send("Server Error");
  }
}

/* ****************************************
*  Process Registration with Server-Side Validation
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const errors = [];

  // Field validation
  if (!account_firstname || !account_lastname || !account_email || !account_password) {
    errors.push("All fields are required.");
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(account_email)) {
    errors.push("A valid email address is required.");
  }

  // Password validation
  if (!passwordPattern.test(account_password)) {
    errors.push("Password must be at least 12 characters long and include 1 uppercase letter, 1 number, and 1 special character.");
  }

  if (errors.length > 0) {
    req.flash("notice", errors.join(" "));
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      formData: { account_firstname, account_lastname, account_email },
      errors,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, registration failed.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      formData: { account_firstname, account_lastname, account_email },
      errors: ["Registration failed due to a server error."]
    });
  }
}

async function loginAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const errors = [];

  // Basic validation
  if (!account_email || !account_password) {
    errors.push("Both email and password are required.");
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(account_email)) {
    errors.push("A valid email address is required.");
  }

  // Password strength validation
  if (!passwordPattern.test(account_password)) {
    errors.push("Invalid password format.");
  }

  if (errors.length > 0) {
    req.flash("notice", errors.join(" "));
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice")
    });
  }

  // Lookup & compare password with DB hash here
  // const account = await accountModel.getAccountByEmail(account_email);
  // const passwordMatch = await bcrypt.compare(account_password, account.account_password);

  // if (!account || !passwordMatch) {
  //   req.flash("notice", "Invalid credentials.");
  //   return res.status(401).render("account/login", {
  //     title: "Login",
  //     nav,
  //     notice: req.flash("notice")
  //   });
  // }

  // req.session.user = account;
  // res.redirect("/account/dashboard");
}


module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
