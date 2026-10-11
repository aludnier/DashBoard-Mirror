export interface MailerPort {
  sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void>;
}

export const MAILER = Symbol('MAILER');
