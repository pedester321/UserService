const sql = require('./databaseConnection')

async function createCollector(collector){
    const{name, email, password, birthdate } = collector
    await sql`
    insert into collectors (name, email, password, birthdate) 
    values (${name}, ${email}, ${password}, ${birthdate})
    `;
}

async function readCollector(email){
    return await sql`select * from collectors where email = ${email}`;
}

async function updateCollector(collector){
    const{name, email, password, birthdate } = collector
    await sql`
    update collectors set name = ${name}, email = ${email}, password = ${password}, birthdate = ${birthdate} where email = ${email}
    `
}

async function deleteCollector(email){
    await sql`
    DELETE FROM collectors WHERE email = ${email}
    `;
}

module.exports = {
    createCollector,
    readCollector,
    updateCollector,
    deleteCollector
}