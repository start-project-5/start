import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../modules/logger/logger.service';

@Injectable()
export class EmailSender {
  sendOtp(email: string, otp: string, arg2: string) {
    throw new Error('Method not implemented.');
  }
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const host = this.configService.get('MAIL_HOST');
    const port = this.configService.get('MAIL_PORT');
    const user = this.configService.get('MAIL_USER');

    console.log('=== MAIL CONFIG ===', { host, port, user });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const html = this.buildOtpTemplate(otp);

    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_USER'),
        to,
        subject: '🔐 Your CITY TOURISM Verification Code',
        html,
      });
      this.logger.log(`OTP email sent to ${to}`, 'EmailSender');
    } catch (err) {
      this.logger.error(
        `Failed to send OTP to ${to}`,
        err.stack,
        'EmailSender',
      );
      throw err;
    }
  }

  private buildOtpTemplate(otp: string): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:16px;overflow:hidden;
                        box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#0057b7 0%,#00a8ff 100%);
                        padding:40px 48px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;
                          letter-spacing:-0.5px;">HH<span style="color:#ffd700;">.UZ</span></h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                  Uzbekistan's #1 Job Platform
                </p>
              </td>
            </tr>
            <!-- BODY -->
            <tr>
              <td style="padding:48px;">
                <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:22px;">
                  Verify Your Email Address
                </h2>
                <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.6;">
                  Use the code below to complete your verification. This code expires in
                  <strong>6 minutes</strong>.
                </p>

                <!-- OTP BOX -->
                <div style="background:#f4f7fe;border:2px dashed #0057b7;border-radius:12px;
                            padding:28px;text-align:center;margin-bottom:32px;">
                  <p style="margin:0 0 8px;color:#888;font-size:12px;
                            text-transform:uppercase;letter-spacing:2px;">
                    Verification Code
                  </p>
                  <span style="font-size:48px;font-weight:900;letter-spacing:12px;
                              color:#0057b7;font-family:'Courier New',monospace;">
                    ${otp}
                  </span>
                </div>

                <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email.
                  Never share this code with anyone.
                </p>
              </td>
            </tr>
            <!-- FOOTER -->
            <tr>
              <td style="background:#f8f9fc;padding:24px 48px;border-top:1px solid #eef0f4;">
                <p style="margin:0;color:#bbb;font-size:12px;text-align:center;">
                  © ${new Date().getFullYear()} HH.UZ · All rights reserved
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
  }
}
