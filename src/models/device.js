const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateIna = moment.tz(Date.now(), "Asia/Bangkok");

const DeviceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	lastUpdate: {
		type: Date,
		default: dateIna,
	},
});

const Device = mongoose.model("Device", DeviceSchema);

exports.Device = Device;
