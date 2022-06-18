const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { Data } = require("../models/data");
const { Device } = require("../models/device");
const moment_timezone = require("moment-timezone");
const lastDateOfMonth = require("../helpers/lastDateOfMonth");

router.get("/:id", async (req, res) => {
	const result = await Device.findById(req.params.id);
	if (!result) return res.status(404).send({ message: "Device is not found" });

	if(!req.query.date) return res.status(400).send({ message: "You must specify the date" });

	const splitDate = req.query.date.split("-");
	const month = parseInt(splitDate[1]);
	const isLeap = parseInt(splitDate[0]) % 4 == 0 ? true : false

	const dataResult = await Data.find({
		deviceId: result._id,
		lastUpdate: {
			$gte: moment_timezone.tz(req.query.date, "Asia/Bangkok"),
			$lte: moment_timezone.tz(
				`${splitDate[0]}-${splitDate[1]}-${lastDateOfMonth(isLeap, month)}`,
				"Asia/Bangkok"
			),
		},
	});

	let water = 0;
	let electric = 0;

	dataResult.forEach((e, i) => {
		water += parseFloat(e.water)
		electric += parseFloat(e.electric)
	})

	res.send({
		water, electric
	})
});

module.exports = router;
