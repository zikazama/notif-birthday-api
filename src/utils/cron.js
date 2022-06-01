const cron = require("node-cron");
const birthday = require("./../middlewares/birthday");

const taskSendBirthday = async () => {
  const task = cron.schedule("0 * * * *", () => {
    birthday.sendBirthdayMw();
  });
  task.start();
  console.log("Cron send birthday start");
};

exports.taskSendBirthday = taskSendBirthday;
