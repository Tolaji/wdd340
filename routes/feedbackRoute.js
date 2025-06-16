const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const utilities = require("../utilities/index");
const checkEmployeeOrAdmin = require("../utilities/checkEmployeeOrAdmin");
const { handleErrors } = require('../utilities/errorHandler');

// Show feedback form
router.get("/", utilities.checkJWTToken, utilities.handleErrors(feedbackController.showFeedbackForm));

// Process feedback form
router.post("/", utilities.checkJWTToken, utilities.handleErrors(feedbackController.processFeedbackForm));

// Show all feedback to admin
router.get("/all", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.displayAllFeedback));

// router.post("/respond/:feedback_id", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.addAdminResponse));

router.post("/respond/:id", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.respondToFeedback));

router.get("/edit/:id", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.editResponseForm));

router.post("/update/:id", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.updateResponse));

router.post("/delete/:id", utilities.checkJWTToken, checkEmployeeOrAdmin, utilities.handleErrors(feedbackController.deleteResponse));


module.exports = router;
