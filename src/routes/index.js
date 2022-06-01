const express = require("express");
const router = express.Router();
const birthday = require("./../middlewares/birthday");
let multer = require("multer");
let upload = multer();

// POST /api/birthdays
router.post("/birthdays", upload.fields([]), birthday.createBirthdayMw);

// PATCH /api/birthdays
router.patch("/birthdays/:id", upload.fields([]), birthday.updateBirthdayMw);

// GET /api/birthdays
router.get("/birthdays", upload.fields([]), birthday.sendBirthdayMw);

// DELETE /api/birthdays
router.delete("/birthdays/:id", upload.fields([]), birthday.deleteBirthdayMw);

module.exports = router;
