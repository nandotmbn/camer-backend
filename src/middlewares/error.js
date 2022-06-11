const Logger = require("./logger");

module.exports = function(err, req, res, next) {
    Logger.error(err.message);
    res.status(500).send({message: "Invalid ID"});
}