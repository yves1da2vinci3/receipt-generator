// sendEmail.js

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const pdf = require('html-pdf'); // Import html-pdf library
const phantomPath = require('phantomjs-prebuilt').path; // Import PhantomJS path
const dotenv = require('dotenv');

dotenv.config();

// Function to read the CSS file and return its content
const readStyles = () => {
    return fs.readFileSync('./templates/styles.css', 'utf-8');
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    }
});

// Read the EJS template file
const template = fs.readFileSync('./templates/receipt.ejs', 'utf-8');

// Render the EJS template with data and styles
const renderTemplate = ejs.compile(template);
const includeStyles = ejs.compile(readStyles());

const randomNumber = Math.random()


// Define email content
const mailOptions = {
    from: 'diomadelacorano@gmail.com', // Sender email address
    to: 'yves.lionel.diomande@gmail.com', // Recipient email address
    subject: 'Receipt for Your Order', // Email subject
    html: renderTemplate({ orderId: '12345', customerName: 'John Doe', amount: '100.00', includeStyles }) // Rendered EJS template with data and styles
};

// Create PDF from HTML content with PhantomJS path option
pdf.create(renderTemplate({ orderId: '12345', customerName: 'John Doe', amount: '100.00', includeStyles }), {
    phantomPath,
    format: 'Letter', // PDF format (A4, Letter, etc.)
    border: '1cm' // PDF border
}).toFile(`receipt${randomNumber}.pdf`, (err, res) => {
    if (err) return console.log(err);
    console.log('PDF created:', res.filename);

    // Attach PDF to email
    mailOptions.attachments = [{
        filename: `receipt${randomNumber}.pdf`,
        path: `receipt${randomNumber}.pdf`,
        contentType: 'application/pdf'
    }];

    // Send email with PDF attachment
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
});
