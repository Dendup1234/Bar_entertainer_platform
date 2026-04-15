import nodemailer from "nodemailer"; // Optional: for better logging

// Create a single reusable transporter instance
let transporter = null;

/**
 * Initialize or get the transporter instance
 * Uses connection pooling for better performance
 */
const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true, // Use connection pooling
  });

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      console.error("Transporter verification failed:", error);
    } else {
      console.log("Email transporter is ready to send messages");
    }
  });

  return transporter;
};

/**
 * Generic email sending function with retry logic
 */
const sendEmail = async (mailOptions, retries = 3) => {
  const transporter = getTransporter();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw new Error(
          `Failed to send email after ${retries} attempts: ${error.message}`,
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }
};

/**
 * HTML template builder for consistent styling
 */
const buildHtmlTemplate = (content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.subject || "EduAgent Notification"}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e0e0e0;
        }
        .info-box {
          background: #e8f4fd;
          border-left: 4px solid #2196f3;
          padding: 12px;
          margin: 16px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${content.title || "EduAgent"}</h1>
      </div>
      <div class="content">
        ${content.body || ""}
        ${content.info ? `<div class="info-box">${content.info}</div>` : ""}
        ${
          content.buttonText && content.buttonUrl
            ? `<a href="${content.buttonUrl}" class="btn">${content.buttonText}</a>`
            : ""
        }
      </div>
      <div class="footer">
        <p>This is an automated message from Bar Entertainer Platform.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </body>
  </html>
`;

// Send OTP Email
export const sendOtpEmail = async (email, otp) => {
  const htmlContent = buildHtmlTemplate({
    title: "Your OTP Code",
    body: `<p>Your One-Time Password (OTP) is:</p>
           <h2 style="text-align: center; color: #2196f3; font-size: 32px;">${otp}</h2>
           <p>This code will expire in <strong>5 minutes</strong>.</p>
           <p>If you didn't request this code, please ignore this email.</p>`,
  });

  await sendEmail({
    from: `"OTP Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: htmlContent,
    priority: "high", // Mark OTP emails as high priority
  });
};

// Send Mentor Connection Email
export const sendStatusEmail = async (email, entertainer, event, status) => {
  const htmlContent = buildHtmlTemplate({
    title: `Booking ${status}`,
    body: `<p>Your booking was ${status} by the ${entertainer} for ${event}</p>`,
    buttonText: "View the event dashboard",
    buttonUrl: `${process.env.APP_URL}`,
  });

  await sendEmail({
    from: `"Bar-Entertainer platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Booking was ${status} by ${entertainer} for the ${event}`,
    text: ``,
    html: htmlContent,
  });
};

// Send Appointment Email for the event booking
export const sendAppointmentEmail = async (email, eventName, date) => {
  const htmlContent = buildHtmlTemplate({
    title: "Booking has been sent",
    body: `<p>You were booked in ${eventName}</p>
           <div class="info-box">
             <p><strong>EventName:</strong> ${eventName}</p>
             <p><strong>Date:</strong> ${date}</p>
           </div>
           <p>accept or reject the offer in your dashboard</p>`,
    buttonText: "Redirect",
    buttonUrl: `${process.env.APP_URL}`,
  });

  await sendEmail({
    from: `"Bar-Entertainer platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Appointment at ${eventName}`,
    text: `You have an appointment at ${eventName} on ${date}`,
    html: htmlContent,
  });
};

// Send Appointment Email for the event booking
export const sendApplicationEmail = async (email, eventName, date) => {
  const htmlContent = buildHtmlTemplate({
    title: "Your application was accepted",
    body: `<p>Your application on ${eventName} was accepted</p>
           <div class="info-box">
             <p><strong>EventName:</strong> ${eventName}</p>
             <p><strong>Date:</strong> ${date}</p>
           </div>`,
    buttonText: "Redirect",
    buttonUrl: `${process.env.APP_URL}`,
  });

  await sendEmail({
    from: `"Bar-Entertainer platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: ` application on ${eventName} was accepted`,
    text: `You have an event at ${eventName} on ${date}`,
    html: htmlContent,
  });
};

// Optional: Clean up transporter on app shutdown
export const closeTransporter = async () => {
  if (transporter) {
    await transporter.close();
    transporter = null;
    console.log("Email transporter closed");
  }
};
