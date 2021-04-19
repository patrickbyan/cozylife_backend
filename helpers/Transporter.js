const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'patrick.pske@gmail.com',
        pass: 'rerudskqbjkdfeyn'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter