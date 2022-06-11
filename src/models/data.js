const mongoose = require("mongoose");
const moment = require('moment-timezone');
const dateIna = moment.tz(Date.now(), "Asia/Bangkok");

const DataSchema = new mongoose.Schema({
	deviceId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Device",
		required: true,
	},
	water: {
		type: Number,
		trim: true,
		required: true,
	},
	electric: {
		type: Number,
		trim: true,
		required: true,
	},
	lastUpdate: {
		type: Date,
		default: Date.now
	},
});

const Data = mongoose.model("Data", DataSchema);

exports.Data = Data;
