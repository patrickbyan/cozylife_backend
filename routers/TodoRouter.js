const express = require('express')
const Router = express.Router()

// Import Controller

const todoController = require('../controllers/TodoController')

const jwtVerify = require('../middleware/JWT')

Router.post('/create', jwtVerify, todoController.create)
Router.post('/get', jwtVerify, todoController.get)
Router.patch('/statusPatch', jwtVerify, todoController.statusPatch)
Router.post('/remove', jwtVerify, todoController.remove)

module.exports = Router