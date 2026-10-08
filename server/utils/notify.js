const Notification = require("../models/Notification");
const { sendNotificationToUser } = require("../socket/socketHandler");

const notifyUser = async ({
  io,
  recipient,
  institution,
  type,
  title,
  message,
  link = "",
  extra = {},
}) => {
  const notification = await Notification.create({
    recipient,
    institution: institution || null,
    type,
    title,
    message,
    link,
    ...extra,
  });

  if (io) {
    sendNotificationToUser(io, recipient.toString(), {
      _id: notification._id,
      type,
      title,
      message,
      link,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

module.exports = { notifyUser };
