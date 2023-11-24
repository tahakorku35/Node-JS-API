const { body, validationResult, param } = require('express-validator');

const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.status(400)
    res.json({ errors: errors.array() })
  } else {
    next()
  }
}

const userRegisterValidationRules =  [
  body('email', "Geçersiz Email!").notEmpty().trim().isLength({ min: 1 }).exists().isEmail(),
  body('phone').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('password').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('firstname').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('lastname').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('age').notEmpty().trim().isLength({ min: 1 }).exists()
]

const userLoginValidationRules =  [
  body('email', "Geçersiz Email!").notEmpty().trim().isLength({ min: 1 }).exists().isEmail(),
  body('password').notEmpty().trim().isLength({ min: 1 }).exists()
]

const userPasswordChangeValidationRules =  [
  param('id').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('old_password').notEmpty().trim().isLength({ min: 1 }).exists(),
  body('new_password').notEmpty().trim().isLength({ min: 1 }).exists()
]









//! add user validation
module.exports = {
  handleInputErrors,
  userRegisterValidationRules,
  userLoginValidationRules,
  userPasswordChangeValidationRules

}