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
    vehicleHtml,
    messages: req.flash("notice")
  })
}

/* ***************************
 *  Build inventory by management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  const messages = req.flash("notice"); 
  res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      messages: messages || [],
      // errors: null, // Placeholder for potential errors
    });
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect(`/inv/detail/${inv_id}`);
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");

    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      messages: req.flash("notice"), 
     
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    });
  }
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

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `Successfully added ${classification_name}`)
    return res.redirect("/inv") // ✅ redirect to management page
  } else {
    const nav = await utilities.getNav()
    req.flash("notice", "Failed to add classification")
    return res.status(500).render("inventory/add-classification", {
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
      console.log("Inventory added:", result)
      req.flash("notice", `${inv_make} ${inv_model} added successfully.`);
      return res.redirect("/inv") // ✅ redirect to management page
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

invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const inventoryData = await invModel.getInventoryByClassificationId(classification_id)
  res.json(inventoryData)
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  const messages = req.flash("notice"); // Always returns an array (even if empty)
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    messages,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}




module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildDetailView: invCont.buildDetailView,
  buildManagementView: invCont.buildManagementView,
  buildAddClassification: invCont.buildAddClassification,
  addClassification: invCont.addClassification,
  buildAddInventory: invCont.buildAddInventory,
  addInventory: invCont.addInventory,
  getInventoryJSON: invCont.getInventoryJSON,
  editInventoryView: invCont.editInventoryView,
  updateInventory: invCont.updateInventory,
}
