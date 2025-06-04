const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

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
      message: "No vehicles match this classification.",
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


module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildDetailView: invCont.buildDetailView
}
