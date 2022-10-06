const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../dbinit/db");
const userController = require("../validation/user");
const validateRole = require("../validation/role");
const validatePassword = require("../validation/password");

// http://localhost:3000/api/sign-up
router.post("/sign-up", userController.validateRegister, (req, res, next) => {
  db.query(
    `SELECT * FROM user WHERE LOWER(username) = LOWER(${db.escape(
      req.body.username
    )});`,
    (err, results) => {
      if (results && results.length) {
        // error
        return res.status(409).send({
          message: "This username is already in use!",
        });
      } else {
        // username not in use
        bcryptjs.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err,
            });
          } else {
            db.query(
              `INSERT INTO user (id, username, password, registered, last_login) VALUES ('${uuid.v4()}',${db.escape(
                req.body.username
              )},'${hash}', now(), now());`,
              (err, results) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    message: err,
                  });
                }
                return res.status(201).send({
                  message: "Registered!",
                });
              }
            );
          }
        });
      }
    }
  );
});

// http://localhost:3000/api/password-change
router.put("/password-change", validatePassword, (req, res, next) => {
  db.query(
    `SELECT password FROM user WHERE LOWER(username) = LOWER(${db.escape(
      req.body.username
    )});`,
    (err, results) => {
      if (err) {
        res.status(500).send({
          message: "Error petition",
        });
      }
      if (!results) {
        res.status(404).send({
          message: "The petition does not exist",
        });
      } else {
        // username not in use
        bcryptjs.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              message: err,
            });
          } else {
            db.query(
              `UPDATE user SET password = '${hash}' WHERE LOWER(username) = LOWER(${db.escape(
                req.body.username
              )});`,
              (err, results) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    message: err,
                  });
                }
                return res.status(201).send({
                  message: "Password Update!",
                });
              }
            );
          }
        });
      }
    }
  );
});

// http://localhost:3000/api/login
router.post("/login", (req, res, next) => {
  db.query(
    // `SELECT * FROM user WHERE username = ${db.escape(req.body.username)};`,
    `SELECT u.username, u.password, r.id AS id_role, r.name AS role_name FROM user u 
      INNER JOIN role_user ON role_user.username_role = u.username 
      INNER JOIN role r ON role_user.id_role = r.id 
      WHERE u.username = ${db.escape(req.body.username)};`,
    (err, results) => {
      if (err) {
        throw err;
        return res.status(400).send({
          message: "Error: " + err,
        });
      }
      if (!results.length) {
        return res.status(400).send({
          message: "Username or password incorrect!",
        });
      }

      bcryptjs.compare(
        req.body.password,
        results[0]["password"],
        (bErr, bResult) => {
          if (bErr) {
            throw bErr;
            return res.status(400).send({
              message: "Username or password incorrect!",
            });
          }
          if (bResult) {
            let rolesArray = [];

            for (let result of results) {
              rolesArray.push({
                id_role: result.id_role,
                role_name: result.role_name,
              });
            }

            //password match
            const token = jwt.sign(
              {
                user: {
                  username: results[0].username,
                  roles: rolesArray,
                },
              },
              "SECRETKEY",
              { expiresIn: "7d" }
            );
            db.query(
              `UPDATE user SET last_login = now() WHERE username = '${results[0].id}'; `
            );
            return res.status(200).send({
              message: "Logged in!",
              token,
              username: results[0].username,
            });
          }
          return res.status(401).send({
            message: "Username or password incorrect!",
          });
        }
      );
    }
  );
});

// http://localhost:3000/api/login/role
router.post("/login/role", (req, res, next) => {
  db.query(
    `INSERT INTO role (id, name) VALUES (${db.escape(req.body.id)}, ${db.escape(
      req.body.name
    )});`,
    (err, results) => {
      if (err) {
        throw err;
        return res.status(400).send({
          message: err,
        });
      }
      return res.status(201).send({
        message: "Role created!",
      });
    }
  );
});

// http://localhost:3000/api/role/user
router.post("/login/role/user", (req, res, next) => {
  db.query(
    `SELECT * FROM role_user WHERE LOWER(username_role) = LOWER(${db.escape(
      req.body.username
    )});`,
    (err, results) => {
      db.query(
        `INSERT INTO role_user (username_role, id_role) VALUES (${db.escape(
          req.body.username
        )}, ${db.escape(req.body.id)}
                );`,
        (err, results) => {
          if (err) {
            throw err;
            return res.status(400).send({
              message: err,
            });
          }
          return res.status(201).send({
            message: "Role created!",
          });
        }
      );
    }
  );
});

// http://localhost:3000/api/users
router.get("/users", (req, res, next) => {
  db.query("SELECT * FROM user;", (err, results) => {
    if (err) {
      throw err;
      return res.status(400).send({
        message: err,
      });
    } else {
      res.send(results);
    }
  });
});

// http://localhost:3000/api/users/username
router.get("/users/:username", (req, res, next) => {
  let username = req.params.username;
  db.query(
    `SELECT * FROM user WHERE username = '${username}';`,
    (err, results) => {
      if (err) {
        res.status(500).send({
          message: "Error petition",
        });
      } else if (!results || results == "") {
        res.status(404).send({
          message: "The user does not exist",
        });
      } else {
        res.status(200).send({ results: results });
      }
    }
  );
});

// http://localhost:3000/api/auth
router.get("/auth", userController.isLoggedIn, (req, res, next) => {
  return res.status(201).send(req.token);
  res.send("This is secret content");
});

// http://localhost:3000/api/verifyToken
router.get(
  "/verifyToken",
  userController.isLoggedInRequest,
  (req, res, next) => {
    return res.status(201).send(req.tokenValidation);
    res.send("This is secret content");
  }
);

module.exports = router;
