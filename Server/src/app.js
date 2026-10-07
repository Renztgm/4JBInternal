const express = require("express");
const cors = require("cors");
const { clientUrl } = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.use("/api", routes);

app.use(errorHandler); // must be last

module.exports = app;