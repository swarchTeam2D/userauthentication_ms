const mysql = require("mysql");

//Production
var db_config = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
};

//Development
// var db_config = {
//   host: "localhost",
//   port: "3306",
//   user: "root",
//   password: "",
//   database: "userauthentication_db",
// };

async function handleDisconnect() {
  let connection;
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("El error de la conexión es: " + err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } else {
      console.log("¡Conectado a la base de datos!");
    } // to avoid a hot loop, and to allow our node script to
  }); // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect(); // lost due to either server restart, or a
    } else {
      // connnection idle timeout (the wait_timeout
      throw err; // server variable configures this)
    }
  });

  return connection;
}

async function getConnection() {
  return await handleDisconnect();
}

async function closeConnection(connection) {
  connection.end(function (err) {
    if (err) {
      return console.log("error: " + err.message);
    }

    console.log("Database connection closed");
  });
}

module.exports = {
  getConnection: getConnection,
  closeConnection: closeConnection,
};
