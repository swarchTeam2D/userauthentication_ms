const jwt = require("jsonwebtoken");

function validateRole(req, res, next) {
  //username min length 5
  if (!req.body.name || req.body.name.length == 5) {
    return res.status(400).send({
      message: "Please enter a role with min. 5 chars",
    });
  }
  next();
}

module.exports = validateRole;
