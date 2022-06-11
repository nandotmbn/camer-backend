const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { Data } = require("../models/data");
const { Device } = require("../models/device");
const moment_timezone = require("moment-timezone");

router.get("/:id", async (req, res) => {
	const result = await Device.findById(req.params.id);
	if (!result) return res.status(404).send({ message: "Device is not found" });

	if (req.query.date) {
		const splitDate = req.query.date.split("-");
		const date = parseInt(splitDate[2]) + 1;
		console.log({
			$gte: moment_timezone.tz(req.query.date, "Asia/Bangkok"),
			$lte: moment_timezone.tz(
				`${splitDate[0]}-${splitDate[1]}-${date}`,
				"Asia/Bangkok"
			),
		});
		const dataResult = await Data.find({
			deviceId: result._id,
			lastUpdate: {
				$gte: moment_timezone.tz(req.query.date, "Asia/Bangkok"),
				$lte: moment_timezone.tz(
					`${splitDate[0]}-${splitDate[1]}-${date}`,
					"Asia/Bangkok"
				),
			},
		});

		return res.send({ ...result._doc, data: dataResult });
	}

	const dataResult = await Data.find({
		deviceId: result._id,
	});

	res.send({ ...result._doc, data: dataResult });
});

router.get("/:id/last", async (req, res) => {
	const result = await Device.findById(req.params.id);
	if (!result) return res.status(404).send("Device is not found");

	const dataResult = await Data.find({
		device: result._id,
	});

	res.send({ ...result._doc, data: dataResult[dataResult.length - 1] });
});

router.post("/:id", async (req, res) => {
	const result = await Device.findById(req.params.id);
	if (!result) return res.status(404).send("NOT FOUND");

	const dataResult = await new Data({
		deviceId: result._id,
		water: req.body.water,
		electric: req.body.electric,
	}).save();

	const dateNow = moment(moment_timezone.tz(Date.now(), "Asia/Bangkok")).format("YYYY-MM-DD");
	const splitDate = dateNow.split("-");
	const date = parseInt(splitDate[2]) + 1;

	console.log({
		$gte: moment_timezone.tz(dateNow, "Asia/Bangkok"),
		$lte: moment_timezone.tz(
			`${splitDate[0]}-${splitDate[1]}-${date}`,
			"Asia/Bangkok"
		),
	})

	const currentResult = await Data.find({
		deviceId: result._id,
		lastUpdate: {
			$gte: moment_timezone.tz(dateNow, "Asia/Bangkok"),
			$lte: moment_timezone.tz(
				`${splitDate[0]}-${splitDate[1]}-${date}`,
				"Asia/Bangkok"
			),
		},
	});

	const ioEmitter = req.app.get("socketIo");
	ioEmitter.emit(req.params.id, { ...result._doc, data: currentResult });

	res.send({ ...result._doc, data: currentResult });
});

router.delete("/:id", async (req, res) => {
	const result = await Data.deleteMany({ deviceId: req.params.id });
	if (!result) return res.status(404).send("NOT FOUND");

	const dataResult = await new Data({
		deviceId: req.params.id,
		water: 0,
		electric: 0,
	}).save();

	res.send(dataResult);
});

module.exports = router;
