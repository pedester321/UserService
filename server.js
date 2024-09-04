require('dotenv').config()

const { createUser, readUserByEmail, updateUser, deleteUser, updateUserEmailConfirmed } = require('./db');
const { sendConfirmationEmail} = require('./email_client')
const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json())

app.get('/', async (req, res) =>{
    
    return res.send('userService');     
})

//Sign Up
app.post('/users', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const payload = {
            type: "email_confirmation",
            email: req.body.email
        }

        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        //TODO: send email

        const user = { 
            name: req.body.name,
            email: req.body.email, 
            password: hashedPassword, 
            birthdate: req.body.birthdate,
            confirmationToken: token
        }

        await createUser(user)
        await sendConfirmationEmail(user)
        res.status(201).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Confirm Email
app.get('/confirm-email', async (req, res) =>{
    const token = req.query.token

    if (!token) {
        return res.status(400).send('Token não fornecido.');
      }
    
      try {
        // Verifica o token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        // Verifica se o token tem o propósito correto
        if (decoded.type !== 'email_confirmation') {
          return res.status(400).send('Tipo de token inválido.');
        }
    
        // Busca o usuário no banco de dados pelo e-mail
        const user = await readUserByEmail(decoded.email);
        if (!user) {
          return res.status(404).send('Usuário não encontrado.');
        }
    
        // Verifica se o e-mail já foi confirmado
        if (user.email_confirmed) {
          return res.status(400).send('E-mail já confirmado.');
        }
    
        // Atualiza o status do usuário para e-mail confirmado
        await updateUserEmailConfirmed(user.email);
    
        // Envia uma resposta de sucesso
        res.send('E-mail confirmado com sucesso.');
    
      } catch (err) {
        console.error(err);
        return res.status(400).send('Token inválido ou expirado.');
      }
})

//Update Collector
app.put('/users', tokenAuth, async (req, res) =>{
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const user = { 
            name: req.body.name,
            email: req.body.email, 
            password: hashedPassword, 
            birthdate: req.body.birthdate 
        }
        await updateUser(user)
        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Delete Collector
app.delete('/users', tokenAuth, async (req, res) =>{
    try {
        await deleteUser(req.body.email)
        res.status(204).send()
    } catch (err) {
        res.status(500).send(err)
    }
})

//Login
app.post('/login', async (req, res) => {
    const user = await readUserByEmail(req.body.email)

    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    if (!user.email_confirmed){
        return res.status(400).send('Please confirm you e-mail')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                birthDate: user.birth_date,
                emailConfirmed: user.email_confirmed,
                role: user.role
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