const logger = require("./logger");

// Email sending is disabled
// To enable: configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env
// and uncomment the nodemailer code

const sendEmail = async ({ to, subject, html }) => {
  logger.info({ to, subject }, "Email sending is disabled");
  return null;
};

const sendVerificationEmail = (user, token) => {
  logger.info({ email: user.email }, "Verification email disabled");
  return Promise.resolve();
};

const sendRoomInviteEmail = (toEmail, roomName, inviteLink) => {
  logger.info({ toEmail, roomName }, "Invite email disabled — share link manually");
  return Promise.resolve();
};

module.exports = { sendEmail, sendVerificationEmail, sendRoomInviteEmail };