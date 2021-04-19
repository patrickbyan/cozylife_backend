// Initialize All Library
const express = require('express')
const app = express()
const cors = require('cors')

// Import Router
const authenticRouter = require('./routers/AuthenticRouter')
const todoRouter = require('./routers/TodoRouter')

// Initialize Cors
app.use(cors())

// Initialize Body Parser
app.use(express.json())

// Initialize PORT 
const PORT = 4000

// Route
app.get('/', (req, res) => {
    res.status(200).send(`
        <h1> AUTHENTIC SYSTEM API </h1>
    `)
})

app.use('/authentic-system', authenticRouter)
app.use('/todo', todoRouter)

app.listen(PORT, () => console.log('API RUNNING ON PORT ' + PORT))