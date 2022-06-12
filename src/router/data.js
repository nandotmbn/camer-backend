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

		let dataBuilt = [];
		let previousData = {
			hour: 0,
			water: 0,
			electric: 0,
			lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
		};

		const lastHour = moment_timezone
			.tz(dataResult[dataResult.length - 1].lastUpdate, "Asia/Jakarta")
			.format("HH");

		for (let i = 0; i <= parseInt(lastHour); i++) {
			dataResult.forEach((e) => {
				const hour = moment_timezone
					.tz(e.lastUpdate, "Asia/Jakarta")
					.format("HH");
				if (hour == i) {
					const dataWillWrap = {
						i,
						water: e.water + previousData.water,
						electric: e.electric + previousData.electric,
						lastUpdate: e.lastUpdate,
					};
					return (previousData = dataWillWrap);
				}

				const dataWillWrap = {
					i,
					water: 0 + previousData.water,
					electric: 0 + previousData.electric,
					lastUpdate: 0,
				};
				return (previousData = dataWillWrap);
			});

			dataBuilt.push(previousData);

			previousData = {
				hour: i + 1,
				water: 0,
				electric: 0,
				lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
			};
		}

		return res.send({ ...result._doc, data: dataBuilt });
	}

	const dataResult = await Data.find({
		deviceId: result._id,
	});

	let dataBuilt = [];
	let previousData = {
		hour: 0,
		water: 0,
		electric: 0,
		lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
	};

	const lastHour = moment_timezone
		.tz(dataResult[dataResult.length - 1].lastUpdate, "Asia/Jakarta")
		.format("HH");

	for (let i = 0; i <= parseInt(lastHour); i++) {
		dataResult.forEach((e) => {
			const hour = moment_timezone
				.tz(e.lastUpdate, "Asia/Jakarta")
				.format("HH");
			if (hour == i) {
				const dataWillWrap = {
					i,
					water: e.water + previousData.water,
					electric: e.electric + previousData.electric,
					lastUpdate: e.lastUpdate,
				};
				return (previousData = dataWillWrap);
			}

			const dataWillWrap = {
				i,
				water: 0 + previousData.water,
				electric: 0 + previousData.electric,
				lastUpdate: 0,
			};
			return (previousData = dataWillWrap);
		});

		dataBuilt.push(previousData);

		previousData = {
			hour: i + 1,
			water: 0,
			electric: 0,
			lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
		};
	}

	res.send({ ...result._doc, data: dataBuilt });
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

	const dateNow = moment(moment_timezone.tz(Date.now(), "Asia/Bangkok")).format(
		"YYYY-MM-DD"
	);
	const splitDate = dateNow.split("-");
	const date = parseInt(splitDate[2]) + 1;

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

	const lastHour = moment_timezone
		.tz(currentResult[currentResult.length - 1].lastUpdate, "Asia/Jakarta")
		.format("HH");

	let dataBuilt = [];
	let previousData = {
		hour: 0,
		water: 0,
		electric: 0,
		lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
	};

	for (let i = 0; i <= parseInt(lastHour); i++) {
		currentResult.forEach((e) => {
			const hour = moment_timezone
				.tz(e.lastUpdate, "Asia/Jakarta")
				.format("HH");
			if (hour == i) {
				const dataWillWrap = {
					i,
					water: e.water + previousData.water,
					electric: e.electric + previousData.electric,
					lastUpdate: e.lastUpdate,
				};
				return (previousData = dataWillWrap);
			}

			const dataWillWrap = {
				i,
				water: 0 + previousData.water,
				electric: 0 + previousData.electric,
				lastUpdate: 0,
			};
			return (previousData = dataWillWrap);
		});

		dataBuilt.push(previousData);

		previousData = {
			hour: i + 1,
			water: 0,
			electric: 0,
			lastUpdate: moment_timezone.tz(Date.now(), "Asia/Jakarta"),
		};
	}

	const ioEmitter = req.app.get("socketIo");
	ioEmitter.emit(req.params.id, { ...result._doc, data: dataBuilt });

	res.send({ ...result._doc, data: dataBuilt });
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
