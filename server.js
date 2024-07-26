require('dotenv').config()

const { createUser, readUser, updateUser, deleteUser } = require('./db');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

const users = []

app.get('/users', tokenAuth ,(req, res) => {
    res.json(users)
})


//Sign Up
app.post('/users', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const user = { name: req.body.name,email: req.body.email, password: hashedPassword }
        createUser(user)
        res.status(201).send()
    } catch(err) {
        res.status(500).send(err)
    }
})


//Login
app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            const userData = { name: user.name }

            const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET)
            res.json({ accessToken: accessToken })
        } else {
            res.send('Not Allowed').send()
        }
    } catch {
        res.status(500).send()
    }
})

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

app.listen(3333)