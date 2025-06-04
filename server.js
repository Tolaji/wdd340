/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const path = require("path")
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/index")
const errorHandler = require("./utilities/errorHandler")





/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // not as views root



/* ***********************
* Routes
 *************************/
app.use('/',static) // Static files middleware




// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

//  Views Directory routes
app.get("/", (req, res) => {
  res.render("index", { title: "Welcome to My Website" });
});

app.get("/custom", (req, res) => {
  res.render("custom", { title: "Custom Page" });
});

app.get("/sedan", (req, res) => {
  res.render("sedan", { title: "Sedan Page" });
});

app.get("/suv", (req, res) => {
  res.render("suv", { title: "SUV Page" });
});

app.get("/truck", (req, res) => {
  res.render("truck", { title: "Truck Page" });
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
// Use global error handler
app.use(errorHandler)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
