const mysql = require("mysql2/promise");

const config = {
  host: "localhost",
  user: "root",
  password: "111111",
  database: "students_manager",
  port: 3306,
};

const db = mysql.createPool(config);
const connection = mysql.createConnection(config);

const connectDB = async () => {
  try {
    (await connection).connect();
    console.log("Connect DB successfully");
  } catch (error) {
    console.log("Connect DB failed.", error.message);
  }
};

module.exports = {
  connectDB,
  db,
};
