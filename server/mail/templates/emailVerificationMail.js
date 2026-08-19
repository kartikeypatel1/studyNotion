const emailVerificationEmail = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
          font-family: Arial, Helvetica, sans-serif;
          color: #333;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="padding: 40px 15px;"
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 600px;
                  width: 100%;
                  background: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                "
              >
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding: 30px 20px 20px;">
                    <div
                      style="
                        display: inline-block;
                        background: #ffd60a;
                        padding: 10px 18px;
                        border-radius: 6px;
                        font-size: 22px;
                        font-weight: bold;
                        color: #111;
                      "
                    >
                      <span
                        style="
                          display: inline-block;
                          width: 24px;
                          height: 24px;
                          line-height: 24px;
                          border-radius: 50%;
                          background: #111;
                          color: #ffd60a;
                          margin-right: 6px;
                        "
                      >
                        S
                      </span>
                      StudyNotion
                    </div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding: 10px 30px 5px;">
                    <h1
                      style="
                        font-size: 24px;
                        margin: 0;
                        color: #222;
                      "
                    >
                      Verify Your Email
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 20px 35px;
                      font-size: 16px;
                      line-height: 1.6;
                    "
                  >
                    <p>Dear ${name},</p>

                    <p>
                      Welcome to StudyNotion! Please verify your email address
                      to activate your account and continue your learning
                      journey.
                    </p>

                    <!-- Button -->
                    <p style="margin: 30px 0;">
                      <a
                        href="${verificationUrl}"
                        style="
                          display: inline-block;
                          background: #ffd60a;
                          color: #111;
                          text-decoration: none;
                          font-weight: bold;
                          padding: 14px 24px;
                          border-radius: 5px;
                        "
                      >
                        Verify Email
                      </a>
                    </p>

                    <p style="font-size: 13px; color: #999;">
                      If you did not create this account, you can safely
                      ignore this email.
                    </p>

                    <p
                      style="
                        font-size: 13px;
                        color: #999;
                        margin-top: 25px;
                      "
                    >
                      Need help?
                      <a
                        href="mailto:info@studynotion.com"
                        style="color: #2463eb;"
                      >
                        info@studynotion.com
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

module.exports = emailVerificationEmail;