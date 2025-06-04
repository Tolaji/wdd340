// utilities/errorHandler.js
const utilities = require("./index")

const errorHandler = async (err, req, res, next) => {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (navErr) {
    console.error("Error building navigation:", navErr.message)
    nav = "<ul><li><a href='/'>Home</a></li></ul>"
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    nav,
    error: err,
  })
}

module.exports = errorHandler
