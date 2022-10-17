const connectFunctions = require("../dbinit/db");

function executeQuery(sql, values) {
  return new Promise(async (resolve, reject) => {
    let db = await connectFunctions.getConnection();
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
    connectFunctions.closeConnection(db);
  });
}

function setQuery(sql, values, res) {
  let result = executeQuery(sql, values).catch((err) => {
    res.status(500).send({
      message: "Error request: " + err,
    });
    throw err;
  });

  return result;
}

module.exports = {
  setQuery: setQuery,
};
