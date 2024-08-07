const sql = require('./databaseConnection')

async function createUser(user){
    const{name, email, password } = user
    await sql`
    insert into users (name, email, password) 
    values (${name}, ${email}, ${password})
    `;
}

async function readUser(email){
    return await sql`select * from users where email = ${email}`;
}

async function updateUser(id, user){
    const{name, email, password } = user
    await sql`
    update users set name = ${name}, email = ${email}, password = ${password} where id = ${id}
    `
}

async function deleteUser(id){
    await sql`
    DELETE FROM users WHERE email = ${id}
    `;
}

module.exports = {
    createUser,
    readUser,
    updateUser,
    deleteUser
}