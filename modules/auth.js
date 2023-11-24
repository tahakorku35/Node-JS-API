const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const UserService = require('../services/user/user_service')

const comparePasswords = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 5)
}

const createJWT = async (user) => {
  const token = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.JWT_SECRET)

  return token
}

const protect = async (req, res, next) => {
  const bearer = req.headers.authorization

  if(!bearer) {
    res.status(401)
    res.json({ message: 'not authorized' })
    return
  }

  const [,token] = bearer.split(' ')

  if(!token) {
    res.status(401)
    res.json({ message: 'not valid token' })
    return
  }


  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    const userFromDB = await UserService.findById(user.id)

    if(userFromDB.token !== token) {
      res.status(401)
      res.json({ message: 'not valid token' })
      return
    }
    req.user = user
    next()
  } catch (e) {
    console.error(e)
    res.status(401)
    res.json({ message: 'not valid ff' })
    return
  }
}

module.exports = {
  comparePasswords,
  hashPassword,
  createJWT,
  protect
}