
const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require('../utilities/index');
const accountModel = require('../models/account-model');
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/;



/* ****************************************
*  Deliver login view
* *************************************** */
const buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: { array: () => [] },
    notice: null,
    formData: {} // for value repopulation
  });
};

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

  try {
    // 🔐 Hash the password before saving
    const hashedPassword = await bcrypt.hash(account_password, 10); // saltRounds = 10

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword // store hashed version
    );

    // if (regResult) {
    //   req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    //   return res.status(201).render("account/login", {
    //     title: "Login",
    //     nav,
    //     errors: [],
    //   });
    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in`);
      return res.redirect("/account/login");
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
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("notice", "An error occurred while registering.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      notice: req.flash("notice"),
      formData: { account_firstname, account_lastname, account_email },
      errors: ["Server error occurred."]
    });
  }
}


async function loginAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors, // Pass express-validator errors
      notice: null,
      formData: { account_email } // Repopulate email input
    });
  }

  try {
    const account = await accountModel.getAccountByEmail(account_email);
    if (!account) {
      req.flash("notice", "Email not found.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: { array: () => [] },
        notice: req.flash("notice"),
        formData: { account_email }
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, account.account_password);
    if (!passwordMatch) {
      req.flash("notice", "Incorrect password.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: { array: () => [] },
        notice: req.flash("notice"),
        formData: { account_email }
      });
    }

    req.session.user = account;
    res.redirect("/account/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: { array: () => [] },
      notice: req.flash("notice"),
      formData: { account_email }
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: { array: () => [] },
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: { array: () => [] },
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccount(req, res) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Dashboard",
    nav,
    flash: req.flash(),
  });
}



module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, accountLogin, buildAccount };
