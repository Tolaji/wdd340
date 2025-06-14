// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventry-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors (invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView))
router.get("/", utilities.handleErrors(invController.buildManagementView));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.get("/getInventory/:classification_id", invController.getInventoryJSON);
// Edit inventory item view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));
// Deliver delete confirmation view
router.get("/delete/:invId", utilities.handleErrors(invController.buildDeleteView));



router.post("/add-classification", 
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification));

router.post("/add-inventory", 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory));

router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory));

// Handle the actual delete operation
router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))


module.exports = router;

