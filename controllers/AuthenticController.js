const validator = require('validator')
const fs = require('fs')
const handlebars = require('handlebars')
const jwt = require('jsonwebtoken')

// Import Connection
const db = require('../connection/Connection')

// Import Helpers
const hashPassword = require('../helpers/Hash')
const CodeGenerator = require('../helpers/CodeGenerator')

// Import Transporter
const transporter = require('../helpers/Transporter')

const register = (req, res) => {
    try {
        // GET DATA FROM FE
        const data = req.body

        let symbol = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

        // VALIDASI DATA
        if(!data.email || !data.password) throw { message: 'Data Must Be Filled' }

        if(!(validator.isEmail(data.email))) throw { message: 'Email Invalid' }

        if(!(symbol.test(data.password))) throw { message: 'Password must contains uppercase, lowercase and numeric characters at least 1 character' }


        try {
            const passwordHashed = hashPassword(data.password)
            data.password = passwordHashed
            data.code = CodeGenerator()

            // STORE DATA KE DB
            // db.query('SELECT * FROM users WHERE email = ?', data.email, (err, result) => {
            //     try {
            //         if(err) throw err

            //         if(result.length === 0){
                        // Insert Data
                        db.query('INSERT INTO users SET ?', data, (err, result) => {
                            try {
                                if(err) throw err

                                let path = 'C:/Important-Document/Purwadhika/Class/Back-End/Authentic_System/template/EmailConfirmation.html'

                                fs.readFile(path, {encoding: 'utf-8'}, (err, file) => {
                                    if(err) throw err

                                    const template = handlebars.compile(file)
                                    const templateResult = template({email: data.email.split('@')[0], link: `http://localhost:3000/confirmation/${result.insertId}/${passwordHashed}/false`, code: data.code, linkCode: `http://localhost:3000/confirmation/${result.insertId}/${passwordHashed}/true`})

                                    // EMAIL CONFIRMATION
                                    transporter.sendMail({
                                        from: 'patrick.pske@gmail.com',
                                        to: data.email,
                                        subject: 'Email Confirmation Test',
                                        html: templateResult
                                    })

                                    .then((response) => {
                                        res.status(200).send({
                                            error: false,
                                            message: 'Register Success. Check Email To Activate'
                                        })
                                    })

                                    .catch((error) => {
                                        res.status(500).send({
                                            error: true,
                                            message: error.message
                                        })
                                    })
                                })
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })
            //         }else{
            //             // Send Error
            //             res.status(200).send({
            //                 error: true,
            //                 message: 'Email Already Exist'
            //             })
            //         }
            //     } catch (error) {
            //         res.status(500).send({
            //             error: true,
            //             message: error.message
            //         })
            //     }
            // })

        } catch (error) {
            res.status(500).send({
                error: true,
                message: 'Failed to Hash Password'
            })
        }

    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

const login = (req, res) => {
    try {
        // Step 1. Get All Data
        const data = req.body
        var email = data.email
        var password = data.password

        // Step 2. Validasi data
        if(!email || !password) throw { message: 'Data Must Be Filled' }

        // Step 3. Hash password untuk cocokan data dengan yang ada di db
        const passwordHashed = hashPassword(data.password)
        password = passwordHashed
        console.log(email, password)

        // Step 4. Cari Email & Password
        db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
            try {
                if(err) throw err
                
                if(result.length === 1){
                    jwt.sign({id: result[0].id, code: result[0].code, is_email_confirmed: result[0].is_email_confirmed}, '123abc', (err, token) => {
                        try {
                            if(err) throw err

                            res.status(200).send({
                                error: false,
                                message: 'Login Success',
                                data: {
                                    token: token
                                }
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: 'Token Error'
                            })
                        }
                    })
                }else{
                    res.status(200).send({
                        error: true,
                        message: 'Email & Password Does Not Match'
                    })
                }
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })

    } catch (error) {
        
    }
}

const sendEmail = (req, res) => {
    transporter.sendMail({
        from: 'patrick.pske@gmail.com',
        to: 'patrickbyann@gmail.com',
        subject: 'Email Confirmation Test',
        html: '<h1>Hi, Welcome</h1>'
    })
    .then((response) => {
        console.log(response)
    })
    .catch((error) => {
        console.log(error)
    })
}

const codeConfirmation = (req, res) => {
    const data = req.body
    var USERcode = data.dataToSend.code

    db.query('SELECT * FROM users WHERE id = ? AND password = ?', [data.dataToSend.id, data.dataToSend.password], (err, result) => {
        try {
            if(err) throw err

            var DBcode = result[0].code

            if(result[0].is_email_confirmed === 0){
                if(USERcode === DBcode){
                    db.query('UPDATE users SET is_email_confirmed = 1 WHERE id = ? AND password = ?', [data.dataToSend.id, data.dataToSend.password], (err, result) => {
                        try {
                            if(err) throw err
    
                            res.status(200).send({
                                error: false,
                                message: 'Account Actived'
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: error.message
                            })
                        }
                    })
                }else{
                    res.status(200).send({
                        error: true,
                        message: 'Your Code Has Been Expired / Failed!'
                    })
                }
            }else{
                res.status(200).send({
                    error: true,
                    message: 'Your Account Already Active'
                })
            }



        } catch (error) {
            res.send(error.message)
        }
    })

    
}


const emailConfirmation = (req, res) => {
    const data = req.body

    db.query('SELECT * FROM users WHERE id = ? AND password = ?', [data.dataToSend.id, data.dataToSend.password], (err, result) => {
        console.log(result)
        try{
            if(err) throw err

            if(result[0].is_email_confirmed === 0){
                db.query('UPDATE users SET is_email_confirmed = 1 WHERE id = ? AND password = ?', [data.dataToSend.id, data.dataToSend.password], (err, result) => {
                    try {
                        if(err) throw err

                        res.status(200).send({
                            error: false,
                            message: 'Account Actived'
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            }else{
                res.status(200).send({
                    error: true,
                    message: 'Your Account Already Active'
                })
            }
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
}

const getEmail = (req, res) => {
    data = req.body
    console.log(data.email)

    let query = 'SELECT * FROM users WHERE email = ?'
    db.query(query, data.email, (err, result) => {
        try {
            if(err) throw err

            if(result.length === 1){
                let path = 'C:/Important-Document/Purwadhika/Class/Back-End/Authentic_System/template/ForgotPassword.html'

                fs.readFile(path, {encoding: 'utf-8'}, (err, file) => {
                    if(err) throw err

                    const template = handlebars.compile(file)
                    const templateResult = template({email: data.email.split('@')[0], link: `http://localhost:3000/new-password/${data.email}`})

                    // EMAIL CONFIRMATION
                    transporter.sendMail({
                        from: 'patrick.pske@gmail.com',
                        to: data.email,
                        subject: 'Forgot Password',
                        html: templateResult
                    })

                    .then((response) => {
                        res.status(200).send({
                            error: false,
                            message: 'Email Found. Check Email to Create New Password'
                        })
                    })

                    .catch((error) => {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    })
                })
                
            }else{
                res.status(404).send({
                    error: true,
                    message: `Sorry, ${data.email} doesn't exists. Please re-check your email`
                })
            }
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
}

const ForgotPassword = (req, res) => {
    try {
        let data = req.body
        let symbol = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        let email = data.newData.email
        let password = data.newData.newPassword

        if(!email || !password) throw { message: 'Data Must Be Filled' }
        if(!(symbol.test(password))) throw { message: 'Password must contains uppercase, lowercase and numeric characters at least 1 character' }

        try {
            const passwordHashed = hashPassword(password)
            password = passwordHashed

            let query = 'UPDATE users SET password = ? WHERE email = ?'
            db.query(query, [password, email], (err, result) => {
                try {
                    if(err) throw err

                    res.status(200).send({
                        error: false,
                        message: 'Password Changed'
                    })
                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: 'Server Error'
                    })
                }
            })
        } catch (error) {
            res.status(406).send({
                error: true,
                message: 'Failed to Hash Password'
            })
        }
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }

}

const checkUserVerify = (req, res) => {
    let data = req.dataToken

    db.query('SELECT * FROM users WHERE id = ?', data.id, (err, result) => {
        try {
            if(err) throw err

            res.status(200).send({
                error: false,
                is_email_confirmed: result[0].is_email_confirmed
            })

        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
        
}


module.exports = {
    register: register,
    sendEmail: sendEmail,
    login: login,
    emailConfirmation: emailConfirmation,
    codeConfirmation: codeConfirmation,
    getEmail: getEmail,
    ForgotPassword: ForgotPassword,
    checkUserVerify: checkUserVerify
}