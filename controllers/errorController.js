// errorController.js (optional)
errorController.triggerError = (req, res, next) => {
  throw new Error("Intentional error for testing")
}

module.exports = errorController;