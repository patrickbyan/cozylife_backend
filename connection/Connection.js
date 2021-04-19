const mysql = require('mysql')

const db = mysql.createConnection({
    user: 'root', 
    password: 'purwadhika',
    database: 'authentic_system',
    port: 3306
})

module.exports = db