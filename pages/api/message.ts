import {NextApiRequest, NextApiResponse} from 'next';
import {sendMail} from '../../services/email';
import {newOrderEmail} from '../../lib/config-server';


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const {body} = req;
        const {contact, message} = body;

        if (contact && message) {
            // send email
            if (newOrderEmail) {
                sendMail(newOrderEmail, 'New message from contact form', `
                    Contact: ${contact}
                    Message: ${message}
                `);
                console.log('Message sent');
                res.status(200).json({message: 'Email sent'});
            } else {
                res.status(500).json({message: 'Email not configured'});
            }

        } else {
            res.status(400).json({message: 'Bad request'});
        }
    }
}
