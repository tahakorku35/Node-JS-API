const router = require('express').Router()
const {
  handleInputErrors,
  userRegisterValidationRules,
  userLoginValidationRules,
  userPasswordChangeValidationRules,
  
 
} = require('../modules/middleware');

const {updatePasswordUser,  registerUser, loginUser, logoutUser, deleteUser} = require('../handlers/user_handler');




// router.post('/user-register', userRegisterValidationRules, handleInputErrors, registerUser)
//  router.post('/user-login', userLoginValidationRules, handleInputErrors, loginUser)
router.post('/user-logout/:id', handleInputErrors, logoutUser)
router.delete('/user-delete/:id', handleInputErrors, deleteUser)
router.post('/user-update-password/:id', userPasswordChangeValidationRules, handleInputErrors, updatePasswordUser)







module.exports = router