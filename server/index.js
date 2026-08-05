const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { connect } = require("./config/database");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
connect();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});