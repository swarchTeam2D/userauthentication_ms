const jwt = require("jsonwebtoken");

module.exports = {
  validateRegister: (req, res, next) => {
    //username min length 5
    if (!req.body.username || req.body.username.length < 5) {
      return res.status(400).send({
        message: "Please enter a username with min. 5 chars",
      });
    }
    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({
        message: "Please enter a password with min. 6 chars",
      });
    }
    // password (repeat) must match
    if (
      !req.body.password_repeat ||
      req.body.password != req.body.password_repeat
    ) {
      return res.status(400).send({
        message: "Both passwords must match",
      });
    }
    next();
  },

  // Postman authentication Bearer Token
  isLoggedIn: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(400).send({
        message: "Token doesn't exist!",
      });
    }
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "SECRETKEY", function (err, token) {
      if (err) {
        return res.status(401).send({
          message: "Your Session is not valid!",
        });
      } else {
        req.token = token;
        next();
      }
    });
  },

  // Request
  isLoggedInRequest: (req, res, next) => {
    if (!req.body.token) {
      return res.status(400).send({
        message: "Token doesn't exist!",
      });
    }

    const tokenValidation = req.body.token;

    jwt.verify(tokenValidation, "SECRETKEY", function (err, tokenValidation) {
      if (err) {
        return res.status(401).send({
          message: "Your Session is not valid!",
        });
      } else {
        req.tokenValidation = tokenValidation.user;
        next();
      }
    });
  },
};
