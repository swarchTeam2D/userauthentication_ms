const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "host.docker.internal",
  port: "33061",
  user: "userauthentication",
  password: "2022",
  database: "userauthentication_db",
});

connection.connect((error) => {
  if (error) {
    console.log("El error de la conexión es: " + error);
    return;
  }
  console.log("¡Conectado a la base de datos!");
});

module.exports = connection;
