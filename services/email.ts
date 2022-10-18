import nodemailer from 'nodemailer'
import {senderEmail, senderEmailName} from '../lib/config-server';


// Mail sending service
export const sendMail = async (to: string, subject: string, text?: string, html?: string) => {

    if (!text && !html) {
        throw new Error('Text or html is required');
    }
    if (text && html) {
        throw new Error('Text and html cannot be both provided');
    }

    const transporter = nodemailer.createTransport({
        service: 'zoho',
        auth: {
            user: process.env.ZOHO_USER,
            pass: process.env.ZOHO_PASS,
        }
    });
    const mailOptions = {
        from: `"${senderEmailName}" <${senderEmail}>`,
        to,
        subject,
        text: text || undefined,
        html: html || undefined,
    };
    await transporter.sendMail(mailOptions);
}
