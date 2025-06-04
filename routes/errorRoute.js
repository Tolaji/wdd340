// File: models/inventory-model.js
const express = require("express");
const router = new express.Router();


router.get("/cause-error", utilities.handleErrors(errorController.triggerError))
