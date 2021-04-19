// Import Connection

const db = require('../connection/Connection')

const create = (req, res) => {
    try {
        // Get all data

        const data = req.body
        const dataToken = req.dataToken

        if(!data.title || !data.description || !data.date) throw { message: 'Data Must Be Filled' }

        let dataToInsert = {
            title: data.title,
            description: data.description,
            date: data.date,
            users_id: dataToken.id
        }

        // Insert Data
        db.query('INSERT INTO todolist SET ?', dataToInsert, (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    message: 'Create Todo Success'
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })

    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

const get = (req, res) => {
    let idUser = req.dataToken.id

    db.query('SELECT * FROM todolist WHERE users_id = ?', idUser, (err, result) => {
        try {
            if(err) throw err

            let newData = []

            result.forEach((value) => {
                let dateIndex = null

                newData.forEach((val, index) => {
                    if(val.date.getDate() === value.date.getDate()){
                        dateIndex = index
                    }
                })

                if(dateIndex === null){
                    newData.push(
                        {
                            date: value.date,
                            todolist: [{
                                id: value.id,
                                title: value.title,
                                description: value.description,
                                date: value.date,
                                status: value.status
                            }]
                        }
                    )
                }else{
                    newData[dateIndex].todolist.push({
                        id: value.id,
                        title: value.title,
                        description: value.description,
                        date: value.date,
                        status: value.status
                    })
                }
            });
            res.status(200).send({
                error: false,
                message: 'Get Data Success',
                data: newData
            })
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
}

const statusPatch = (req, res) => {
    let data = req.body
    let dataToken = req.dataToken

    let idTodo = data.idTodo
    let idUser = dataToken.id
    let currentStatus = data.currentStatus
    
    db.query('SELECT * FROM todolist WHERE id = ? AND users_id = ?', [idTodo, idUser], (err, result) => {
        try {
            if(err) throw err
            
            let dbStatus = result[0].status
            
            db.query('UPDATE todolist SET status = ? WHERE id = ? AND users_id = ?', [!currentStatus, idTodo, idUser], (err, result) => {
                try {
                    if(err) throw err

                    res.status(200).send({
                        error: false,
                        message: 'Change Status Success',
                        dbStatus: dbStatus
                    })
                } catch (error) {
                    res.status(500).send({
                        error: false,
                        message: 'Server Error'
                    })
                }
            })
        } catch (error) {
            res.status(406).send({
                error: true,
                message: error.message
            })

        }
    })
}

const remove = (req, res) => {
    let data = req.body

    let dataToken = req.dataToken

    let idTodo = data.idTodo
    let idUser = dataToken.id

    db.query('SELECT * FROM todolist WHERE id = ? AND users_id = ?', [idTodo, idUser], (err, response) => {
        try {
            if(err) throw err

            db.query('DELETE FROM todolist WHERE id = ? AND users_id = ?', [idTodo, idUser], (err, response) => {
                try {
                    if(err) throw err

                    res.status(200).send({
                        error: false,
                        message: 'DELETE TODO SUCCESS'
                    })
                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: 'SERVER ERROR'
                    })
                }
            })
        } catch (error) {
            res.status(406).send({
                error: true,
                message: error.message
            })
        }
    })
}

module.exports = {
    create: create,
    get: get,
    statusPatch: statusPatch,
    remove: remove
}