const bcrypt = require('bcrypt')

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10) 
    return bcrypt.hashSync(password, salt)
}

function comparePassword(password, hasedPassword) {
    return bcrypt.compareSync(password, hasedPassword)
}

module.exports = {
    hashPassword, 
    comparePassword
}