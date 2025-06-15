// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventry-validation");
const checkEmployeeOrAdmin = require("../utilities/checkEmployeeOrAdmin")


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors (invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView))
router.get("/", checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagementView));
router.get("/add-classification", checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory));
router.get("/getInventory/:classification_id", checkEmployeeOrAdmin, invController.getInventoryJSON);
// Edit inventory item view
router.get("/edit/:inv_id", checkEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView));
// Deliver delete confirmation view
router.get("/delete/:invId", checkEmployeeOrAdmin, utilities.handleErrors(invController.buildDeleteView));



router.post("/add-classification", 
  checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification));

router.post("/add-inventory", 
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory));

router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory));

// Handle the actual delete operation
router.post("/delete", checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventoryItem))


module.exports = router;

