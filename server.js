const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require("nodemailer");
const https = require('https');
const request = require('request');
const axios = require('axios');

const cors = require('cors');
const app = express();
const env = require('dotenv').config();
const connectDB = require('./config/db');

app.use(cors()); // CORS middleware burada kullanılıyor
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Router = require('./routes/users');

const { userRegisterValidationRules, userLoginValidationRules, handleInputErrors } = require('./modules/middleware');

const { registerUser, loginUser, getUserList, newPasswordUser, logoutUser, deleteUser, updatePasswordUser } = require('./handlers/user_handler');
const { protect } = require('./modules/auth');

const { createMeeting, updateMeeting,getMeeting } = require('./handlers/meeting_handler');
const { createMessage, getMessage } = require('./handlers/message_handler');

app.post('/create-message', createMessage);
app.get('/get-message', createMessage);


app.get('/getInstagram', (req, res) => {
  const accessToken = process.env.INSTAGRAM_API_ACCESS_TOKEN;

  const options = {
    method: 'GET',
    url: `https://graph.instagram.com/v12.0/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{media_type,media_url,thumbnail_url}&access_token=${accessToken}`,
  };

  request(options, (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      try {
        const data = JSON.parse(body);
        const processedData = processCarouselPosts(data);
        res.json(processedData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  });
});

function processCarouselPosts(data) {
  if (!data.data || !Array.isArray(data.data)) {
    return data;
  }

  data.data.forEach(post => {
   
    if (post.media_type === 'CAROUSEL_ALBUM' && post.children && Array.isArray(post.children.data)) {

      post.media_type = 'CAROUSEL';

      
      post.media_items = post.children.data;

     
      delete post.children;
    }
  });

  return data;
}

// Function to make a request using the 'request' library
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
}




app.post('/create-meeting', createMeeting);
app.post('/get-meeting', getMeeting);
app.put('/update-meeting/:id',updateMeeting)



const { subscriberCreate, getCreateSubscriber } = require('./handlers/subscriber_handler');
const { createContact, getContact ,getInstagram } = require('./handlers/contact_handler');

app.post('/create-contact', createContact);
app.post('/get-contact', getContact);
app.get('/instagram-posts', getInstagram);


// Port tanımlaması
const port = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', protect, Router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.post('/subscriber-create', subscriberCreate); // Abone olma
app.get('/subscriber-get', getCreateSubscriber); // abone listeleme

app.put('/new-password', handleInputErrors, newPasswordUser);
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
