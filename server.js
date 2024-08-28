require('dotenv').config()

const { createCollector, readCollector, updateCollector, deleteCollector } = require('./db');
const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json())

//Sign Up
app.post('/collectors', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const collector = { name: req.body.name, email: req.body.email, password: hashedPassword, birthdate: req.body.birthdate }
        await createCollector(collector)
        res.status(201).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Update Collector
app.put('/collectors', tokenAuth, async (req, res) =>{
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const collector = { name: req.body.name, email: req.body.email, password: hashedPassword, birthdate: req.body.birthdate }
        await updateCollector(collector)
        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Delete Collector
app.delete('/collectors', tokenAuth, async (req, res) =>{
    try {
        await deleteCollector(req.body.email)
        res.status(204).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Login
app.post('/login', async (req, res) => {
    const collector = await readCollector(req.body.email)

    if (collector[0] == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, collector[0].password)) {
            
            const payload = {
                id: collector[0].id,
                name: collector[0].name,
                email: collector[0].email,
                birthDate: collector[0].birthdate
            }
            const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)

            res.json({ token: token })
        } else {
            res.send(401).send('Not Allowed')
        }
    } catch {
        res.status(500).send()
    }
})


//Middleware de auth
function tokenAuth(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) return res.sendStatus(403)
        req.userData = data
        next()
    })
}

app.listen(
    {
        host: '0.0.0.0',
        port: process.env.PORT ?? 3333,
    },
)