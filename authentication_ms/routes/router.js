const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../dbinit/db");
const userController = require("../validation/user");
const validateRole = require("../validation/role");
const validatePassword = require("../validation/password");

const queryFunctions = require("../connection/request");
const setQuery = queryFunctions.setQuery;

// http://localhost:3000/api/sign-up
router.post(
  "/sign-up",
  userController.validateRegister,
  async (req, res, next) => {
    let username = req.body.username;
    let sql = "SELECT * FROM user WHERE LOWER(username) = LOWER(?)";
    let results;
    try {
      results = await setQuery(sql, [username], res);
      if (results && results.length) {
        // error
        return res.status(409).send({
          message: "This username is already in use!",
        });
      }
    } catch (e) {
      console.log(e);
      return;
    }
    // username not in use
    bcryptjs.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).send({
          message: err,
        });
      }

      sql =
        "INSERT INTO user (id, username, password, registered, last_login) VALUES (?,?,?,now(),now())";
      // db.query(
      //   `INSERT INTO user (id, username, password, registered, last_login) VALUES ('${uuid.v4()}',${db.escape(
      //     req.body.username
      //   )},'${hash}', now(), now());`,

      try {
        results = await setQuery(sql, [uuid.v4(), username, hash], res);
      } catch (e) {
        console.log(e);
        return;
      }

      return res.status(201).send({
        message: "Registered!",
      });
    });
  }
);

// http://localhost:3000/api/password-change
router.put("/password-change", validatePassword, async (req, res, next) => {
  let username = req.body.username;
  let sql = "SELECT password FROM user WHERE LOWER(username) = LOWER(?)";
  let results;

  try {
    results = await setQuery(sql, [username], res);

    if (!results || results == "" || !results.length) {
      res.status(404).send({
        message: "The username does not exist",
      });
    }
  } catch (e) {
    console.log(e);
    return;
  }
  // username not in use
  bcryptjs.hash(req.body.password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).send({
        message: err,
      });
    }

    sql = "UPDATE user SET password = ? WHERE LOWER(username) = LOWER(?)";

    try {
      results = await setQuery(sql, [hash, username], res);
    } catch (e) {
      console.log(e);
      return;
    }

    return res.status(201).send({
      message: "Password Update!",
    });
  });
});

// http://localhost:3000/api/login
router.post("/login", async (req, res, next) => {
  let username = req.body.username;
  let sql =
    "SELECT u.username, u.password, r.id AS id_role, r.name AS role_name FROM user u " +
    "INNER JOIN role_user ON role_user.username_role = u.username " +
    "INNER JOIN role r ON role_user.id_role = r.id " +
    "WHERE u.username = ?;";
  let results;
  try {
    results = await setQuery(sql, [username], res);
    if (!results.length) {
      return res.status(400).send({
        message: "Username or password incorrect!",
      });
    }
  } catch (e) {
    console.log(e);
    return;
  }

  let user = results[0];

  bcryptjs.compare(req.body.password, user.password, async (bErr, bResult) => {
    if (bErr) {
      return res.status(500).send({
        message: "Internal server error",
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
            username: user.username,
            roles: rolesArray,
          },
        },
        "SECRETKEY",
        { expiresIn: "7d" }
      );
      sql = "UPDATE user SET last_login = now() WHERE username = ?";

      try {
        results = await setQuery(sql, [user.id], res);
      } catch (e) {
        console.log(e);
        return;
      }
      return res.status(200).send({
        message: "Logged in!",
        token,
        username: user.username,
      });
    }
    return res.status(401).send({
      message: "Username or password incorrect!",
    });
  });
});

// http://localhost:3000/api/login/role
router.post("/login/role", async (req, res, next) => {
  let id = req.body.id;
  let name = req.body.name;
  let sql = "INSERT INTO role (id, name) VALUES (?,?)";
  let results;
  try {
    results = await setQuery(sql, [id, name], res);
  } catch (e) {
    console.log(e);
    return;
  }

  return res.status(201).send({
    message: "Role created!",
  });
});

// http://localhost:3000/api/role/user
router.post("/login/role/user", async (req, res, next) => {
  let username = req.body.username;
  let sql = "SELECT * FROM role_user WHERE LOWER(username_role) = LOWER(?)";
  let results;
  try {
    results = await setQuery(sql, [username], res);
  } catch (e) {
    console.log(e);
    return;
  }
  let id = req.body.id;

  sql = "INSERT INTO role_user (username_role, id_role) VALUES (? , ?)";
  try {
    results = await setQuery(sql, [username, id], res);
  } catch (e) {
    console.log(e);
    return;
  }

  return res.status(201).send({
    message: "Role created!",
  });
});

// http://localhost:3000/api/users
router.get("/users", async (req, res, next) => {
  let sql = "SELECT * FROM user;";
  let results;
  try {
    results = await setQuery(sql, [], res);
  } catch (e) {
    console.log(e);
    return;
  }

  res.send(results);
});

// http://localhost:3000/api/users/username
router.get("/users/:username", async (req, res, next) => {
  let username = req.params.username;
  let sql = "SELECT * FROM user WHERE username = ?";
  let results;
  try {
    results = await setQuery(sql, [username], res);
    if (!results || results == "") {
      res.status(404).send({
        message: "The user does not exist",
      });
    }
  } catch (e) {
    console.log(e);
    return;
  }

  res.status(200).send({ results: results });
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

// http://localhost:3000/api/verifyToken
router.post(
  "/verifyTokenPost",
  userController.isLoggedInRequest,
  (req, res, next) => {
    return res.status(201).send(req.tokenValidation);
    res.send("This is secret content");
  }
);

module.exports = router;
