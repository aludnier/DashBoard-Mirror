import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { MailerPort } from '../../../domain/port/mailer.js';

@Injectable()
export class NodemailerMailerAdapter implements MailerPort {
  private readonly logger = new Logger(NodemailerMailerAdapter.name);
  private readonly from = process.env.MAIL_FROM ?? 'Dashboard <no-reply@dashboard.local>';

  private readonly transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 1025),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;

  async sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP_HOST not set, verification link for ${to}: ${verifyUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Confirm your Dashboard account',
      text: `Hi ${name},\n\nConfirm your account by opening this link:\n${verifyUrl}\n\nThe link expires in 24 hours.`,
      html: `<p>Hi ${name},</p>
             <p>Confirm your account by clicking the link below:</p>
             <p><a href="${verifyUrl}">Verify my email</a></p>
             <p>The link expires in 24 hours.</p>`,
    });
  }
}
