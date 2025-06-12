const invModel = require("../models/inventory-model")
const utilities = require("../utilities/index")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  let nav = await utilities.getNav()

  // 🔍 Handle no results
  if (!data || data.length === 0) {
    return res.status(404).render("errors/404", {
      title: "No Vehicles Found",
      messages: "No vehicles match this classification.",
      nav,
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by detail view
 * ************************** */
invCont.buildDetailView = async function(req, res, next) {
  const inv_id = req.params.invId
  const nav = await utilities.getNav()
  const vehicleData = await invModel.getVehicleById(inv_id)
  const vehicleHtml = await utilities.buildDetailView(vehicleData)
  const title = `${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render('./inventory/detail', {
    title,
    nav,
    vehicleHtml
  })
}

/* ***************************
 *  Build inventory by management view
 * ************************** */
invCont.buildManagementView = async function (req, res) {
  const nav = await utilities.getNav();
  const messages = req.flash("notice"); // Flash any success/failure messages
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: messages || [],  // 🛠 ensure it's always an array
    // errors: null, // Placeholder for potential errors
  });
};

/* ***************************
 *  Build inventory by add classification view
 * ************************** */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash("notice"),
  })
}

/* ***************************
 *  Build inventory by management view
 * ************************** */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `Successfully added ${classification_name}`)
    nav = await utilities.getNav() // update nav
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
    })
  } else {
    req.flash("notice", "Failed to add classification")
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
    })
  }
}

/* ***************************
 *  Build inventory by add inventory view
 * ************************** */
invCont.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    messages: req.flash("notice"),
  })
}

invCont.addInventory = async (req, res) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const nav = await utilities.getNav();

  try {
    const result = await invModel.addInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });

    if (result) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully.`);
      res.redirect("/inv"); // Or wherever your management view is
    } else {
      throw new Error("Insert failed.");
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("notice", "There was an error adding the vehicle.");
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.status(500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      messages: req.flash("notice"),
      ...req.body,
    });
  }
};


module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildDetailView: invCont.buildDetailView,
  buildManagementView: invCont.buildManagementView,
  buildAddClassification: invCont.buildAddClassification,
  buildAddInventory: invCont.buildAddInventory,
  addInventory: invCont.addInventory,
}
