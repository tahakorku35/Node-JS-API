const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require("nodemailer");

const cors = require('cors');
const app = express();
const env = require('dotenv').config();
const connectDB = require('./config/db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });
  

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;







const Router = require('./routes/users');

const { userRegisterValidationRules, userLoginValidationRules, handleInputErrors } = require('./modules/middleware');
const { registerUser, loginUser, getUserList, newPasswordUser, logoutUser, deleteUser, updatePasswordUser } = require('./handlers/user_handler');
const { protect } = require('./modules/auth');

const {  getSubscribedUser,subscribeUser} = require('./handlers/subscribed_handler');

const { enrollUser,getEnrollUser} = require('./handlers/enroll_handler');
const { createContact,getContact} = require('./handlers/contact_handler');


app.post('/create-contact', createContact);
app.post('/get-contact', getContact);


// Port tanımlaması
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', protect, Router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/enroll-create',enrollUser);
app.get('/enrolls', getEnrollUser);


app.post('/subscribe-create',subscribeUser);
app.get('/subscribe', getSubscribedUser);

app.put('/new-password',handleInputErrors, newPasswordUser);
app.get('/users', handleInputErrors, getUserList);
app.post('/user-register', userRegisterValidationRules, handleInputErrors, registerUser);
app.post('/user-login', userLoginValidationRules, handleInputErrors, loginUser);
// app.post('/user-logout/:id', handleInputErrors, logoutUser);
// app.delete('/user-delete/:id', handleInputErrors, deleteUser);

const startServer = () => {
  try {
    // Connect to DB
    connectDB();

    // Start & Listen to the requests
    app.listen(port, () => console.log(`Server started listening on ${port}`));
  } catch (error) {
    console.log(error);
  }
};

startServer();
