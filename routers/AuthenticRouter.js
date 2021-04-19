const express = require('express')
const Router = express.Router()

// Import Controller
const authenticController = require('../controllers/AuthenticController')

// Import Router
const jwtVerify = require('../middleware/JWT')

Router.post('/register', authenticController.register)
Router.get('/send-email', authenticController.sendEmail)
Router.post('/login', authenticController.login)
Router.patch('/confirmation', authenticController.emailConfirmation)
Router.patch('/code', authenticController.codeConfirmation)
Router.post('/get-email', authenticController.getEmail)
Router.patch('/forgot-password', authenticController.ForgotPassword)
Router.post('/user-verify', jwtVerify, authenticController.checkUserVerify)

module.exports = Router