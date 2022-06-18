require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const Startup = require("./src/middlewares/startup");
const WebSocket = require("./src/middlewares/web-socket");
const error = require("./src/middlewares/error");
const io = require("socket.io")(http, {
	cors: { origin: "*" },
});

Startup(app, io);
WebSocket(io);

app.use("/device", require('./src/router/device'))
app.use("/data", require('./src/router/data'))
app.use("/bill", require('./src/router/bill'))

app.use(error);
const PORT = process.env.PORT || 8888;
http.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
