const jwt = require("jsonwebtoken")
require("dotenv").config()

function checkEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "Please log in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const accountType = decoded.account_type

    if (accountType === "Employee" || accountType === "Admin") {
      req.accountData = decoded // ✅ attach decoded info for optional use
      return next()
    } else {
      req.flash("notice", "Access denied: You do not have permission.")
      return res.redirect("/account/login")
    }

  } catch (error) {
    console.error("JWT verification failed:", error.message)
    req.flash("notice", "Session expired or invalid. Please log in again.")
    return res.redirect("/account/login")
  }
}

module.exports = checkEmployeeOrAdmin
