import nodemailer from 'nodemailer';

 const transporter = nodemailer.createTransport({
    service:'gmail',
    host:process.env.SMTP_HOST,
    port:587,
    secure:true,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS,
    },
});
export default transporter;
