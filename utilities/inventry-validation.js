const { body, validationResult } = require("express-validator");

const invValidate = {};

/* ----------------------
  Classification Validation
----------------------- */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters.")
  ];
};

invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("../utilities/index").getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name,
    });
    return;
  }

  next();
};

/* ----------------------
  Inventory Validation
----------------------- */
invValidate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Vehicle make is required."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Vehicle model is required."),
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Enter a valid price."),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Enter a valid mileage value."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Choose a valid classification.")
  ];
};

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("../utilities/index").getNav();
    const classificationList = await require("../utilities/index").buildClassificationList(
      req.body.classification_id
    );

    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body, // Spread the form values to refill the form
    });
    return;
  }

  next();
};

// ----------------------
// Inventory Validation - redirect back to edit view on error
// ----------------------
invValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("../utilities/index").getNav();
    const classificationList = await require("../utilities/index").buildClassificationList(
      req.body.classification_id
    );

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
      classification_id
    } = req.body;

    const itemName = `${inv_make} ${inv_model}`;

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
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
    return;
  }

  next();
};


module.exports = invValidate;
