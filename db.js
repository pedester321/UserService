const sql = require('./databaseConnection')

async function createUser(user){
    const{name, email, password, birthdate, confirmationToken } = user
    await sql`
    insert into users (name, email, password, birth_date, confirmation_token) 
    values (${name}, ${email}, ${password}, ${birthdate}, ${confirmationToken})
    `;
}

async function readUserByEmail(email){
    const users = await sql`select * from users where email = ${email}`;
    return users[0]
}

async function updateUser(user){
    const{name, email, password, birthdate } = user
    await sql`
    update users set name = ${name}, email = ${email}, password = ${password}, birthdate = ${birthdate} where email = ${email}
    `
}

async function deleteUser(email){
    await sql`
    DELETE FROM users WHERE email = ${email}
    `;
}

async function updateUserEmailConfirmed(email){
    
    await sql`
    update users set email_confirmed = true where email = ${email}
    `
}

module.exports = {
    createUser,
    readUserByEmail,
    updateUser,
    deleteUser,
    updateUserEmailConfirmed
}