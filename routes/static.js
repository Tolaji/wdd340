const path = require("path");
const express = require('express');
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static(path.join(__dirname, "..", "public")));

module.exports = router;



