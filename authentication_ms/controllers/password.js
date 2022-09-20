const jwt = require("jsonwebtoken");

function validatePassword(req, res, next) {
  // password min 6 chars
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).send({
      message: "Please enter a password with min. 6 chars",
    });
  }
  next();
}

module.exports = validatePassword;
