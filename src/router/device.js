const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Data } = require("../models/data");
const { Device } = require("../models/device");
const moment_timezone = require("moment-timezone")

router.get("/register", async (req, res) => {
	const dateIna = moment_timezone.tz(Date.now(), "Asia/Bangkok");
	if (!req.query.name)
		return res.status(401).send({ message: "You must specify the name" });

	const isExist = await Device.findOne({
		name: req.query.name,
	});
	if (isExist) return res.status(400).send({ message: "Name has been taken" });

	const result = await new Device({
		name: req.query.name,
	}).save();

	const dataResult = await new Data({
		deviceId: result._id,
		water: 0,
		electric: 0,
	}).save();

	res.send({ ...result._doc, data: [dataResult] });
});

router.get("/", async (req, res) => {
	const result = await Device.find();
	res.send(result);
});

router.delete("/:id", async (req, res) => {
	const result = await Device.findByIdAndDelete(req.params.id);
	const resultData = await Data.deleteMany({
		device: result._id,
	});

	res.send(result);
});

module.exports = router;
