require("dotenv").config();
const asyncMw = require("async-express-mw");
const model = require("./../models");
const yup = require("yup");
const _ = require("lodash");
const moment = require("moment-timezone");
const InvariantError = require("./../utils/exceptions/InvariantError");

exports.createBirthdayMw = asyncMw(async (req, res, next) => {
  try {
    // validation
    console.log(req.body);
    const schema = yup.object().shape({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      date: yup.date().required(),
      location: yup.string().required(),
    });
    await schema.validate(req.body);
    const timeZones = await moment.tz.names();
    if (!timeZones.includes(req.body.location)) {
      throw new InvariantError("Cannot assign this location");
    }

    // filter input
    const dataBirthday = _.pick(req.body, _.keys(model.birthday.rawAttributes));
    dataBirthday.date = moment(
      `${req.body.date} 09:00:00`,
      "YYYY-MM-DD HH:mm:ss",
      true
    )
      .tz(req.body.location)
      .format("YYYY-MM-DDTHH:mm:ssZ");
    const birthday = await model.birthday.create(dataBirthday);

    // response
    return res.status(201).json({
      data: birthday,
      message: "Success to create reminder",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ ...error, message: error.message });
  }
});

exports.sendBirthdayMw = asyncMw(async (req, res, next) => {
  try {
    // get data now or past
    const birthdays = await model.birthday.findAll({
      where: {
        isSent: 0,
      },
    });

    birthdays.forEach(async (birthday) => {
      // check date and time
      const baseBirth = moment(birthday.dataValues.date);
      console.log(baseBirth);
      console.log(moment());
      const birthdayDay = baseBirth.format("DD");
      const birthdayMonth = baseBirth.format("MM");
      const currentYear = moment().format("YYYY");
      const birthdayTime = baseBirth.format("HH:mm:ss");
      const checkCurrentBirth = moment(
        `${currentYear}-${birthdayMonth}-${birthdayDay} ${birthdayTime}`,
        "YYYY-MM-DD HH:mm:ss",
        true
      );

      console.log(checkCurrentBirth.diff(moment()));
      if (checkCurrentBirth.diff(moment())) {
        const https = require("https");

        const data = JSON.stringify(
          `Hey, ${birthday.dataValues.firstName} ${birthday.dataValues.lastName} it\’s your birthday`
        );

        const options = {
          hostname: "hookb.in",
          port: 443,
          path: "/pzjN8QJ99qhR2qoRwJoD",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
          },
        };
        const req = https.request(options, (res) => {
          console.log(`status: ${res.statusCode}`);
        });

        req.write(data);
        req.end();

        await model.birthday.update(
          { isSent: 1 },
          {
            where: {
              id: birthday.dataValues.id,
            },
          }
        );
      }
    });

    // res.json({ message: "excecute message", data: birthdays });
    console.log({ message: "excecute message", data: birthdays });
  } catch (error) {
    // return res
    //   .status(error.statusCode || 500)
    //   .json({ ...error, message: error.message });
    console.log({ ...error, message: error.message });
  }
});

exports.updateBirthdayMw = asyncMw(async (req, res, next) => {
  try {
    // validtion params
    const schemaParams = yup.object().shape({
      id: yup.number().required(),
    });
    await schemaParams.validate(req.params);

    // validation body
    const schemaBody = yup.object().shape({
      firstName: yup.string(),
      lastName: yup.string(),
      birthday: yup.date(),
      location: yup.string(),
    });
    await schemaBody.validate(req.body);
    if (req.body.location) {
      const timeZones = Object.values(moment.tz.names());
      if (!timeZones.includes(req.body.location)) {
        throw new InvariantError("Cannot assign this location");
      }
    }

    // filter input
    const birthday = await model.birthday.findOne({ id: req.params.id });
    const dataBirthday = _.pick(
      birthday.dataValues,
      _.keys(model.birthday.rawAttributes)
    );
    const dataBirthdayUpdate = { ...dataBirthday, ...req.body };
    if (req.body.date) {
      dataBirthday.date = moment(
        `${req.body.date} 09:00:00`,
        "YYYY-MM-DD HH:mm:ss",
        true
      )
        .tz(dataBirthday.location)
        .format("YYYY-MM-DDTHH:mm:ssZ");
    }
    await model.birthday.update(dataBirthdayUpdate, {
      where: { id: req.params.id },
    });

    // response
    return res.status(200).json({
      data: dataBirthdayUpdate,
      message: "Success to update reminder",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ ...error, message: error.message });
  }
});

exports.deleteBirthdayMw = asyncMw(async (req, res, next) => {
  try {
    // validation
    const schema = yup.object().shape({
      id: yup.number().required(),
    });
    await schema.validate(req.params);

    // delete
    await model.birthday.destroy({ where: { id: req.params.id } });

    // response
    return res.status(204).json();
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ ...error, message: error.message });
  }
});
