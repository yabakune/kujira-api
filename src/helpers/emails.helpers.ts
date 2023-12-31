import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export async function emailUser(
  targetEmailAddress: string,
  subject: string,
  body: string[]
) {
  const html = body.map((text: string) => `<p>${text}</p>`).join("");
  const message = {
    from: `"Kujira" <${process.env.EMAIL_HELP}>`,
    to: targetEmailAddress,
    subject,
    html,
  };

  // ↓↓↓ Development ↓↓↓ //
  if (process.env.NODE_ENV === "development") {
    let devTestAccount = await nodemailer.createTestAccount();
    const devSMTPtransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: devTestAccount.user,
        pass: devTestAccount.pass,
      },
    });
    const testInfo = await devSMTPtransporter.sendMail(message);
    console.log("Message sent: %s", testInfo.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(testInfo));
  }

  // ↓↓↓ Production ↓↓↓ //
  else {
    const prodSMTPtransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      tls: { ciphers: "SSLv3" },
      auth: {
        user: process.env.EMAIL_HELP,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    prodSMTPtransporter.sendMail(
      message,
      function (error: any, information: any) {
        if (error) console.error("Email Error:", error);
        else console.log("Sent Response:", information.response);
      }
    );
  }
}
