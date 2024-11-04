const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

class EmailService {
  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const params = {
      Source: process.env.SES_VERIFIED_EMAIL,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: "Reset Your Password",
          Charset: "UTF-8"
        },
        Body: {
          Html: {
            Data: this.getPasswordResetTemplate(resetLink),
            Charset: "UTF-8"
          },
          Text: {
            Data: this.getPasswordResetPlainText(resetLink),
            Charset: "UTF-8"
          }
        }
      }
    };

    try {
      const result = await this.sesClient.send(new SendEmailCommand(params));
      console.log('Password reset email sent:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  getPasswordResetTemplate(resetLink) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Your Password</title>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetPlainText(resetLink) {
    return `
      Reset Your Password
      
      Click the link below to reset your password:
      ${resetLink}
      
      If you didn't request this, please ignore this email.
      This link will expire in 1 hour.
    `;
  }
}

module.exports = new EmailService();