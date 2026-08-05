const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {})
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      process.exit(1); // Exit the process with an error code
    });
};

