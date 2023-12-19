const Sequelize = require("sequelize");
const db = new Sequelize("tmdb", null, null, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

db.authenticate()
  .then(() => {
    console.log("Conexion exitosa a la base de datos", db.config.database);
  })
  .catch((err) => {
    console.error("No se pudo conectar a la base de datos", err);
  });
module.exports = db;
