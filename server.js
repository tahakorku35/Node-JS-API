const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require("nodemailer");
const https = require('https');
const request = require('request');
const axios = require('axios');
const mongoose = require('mongoose');

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


app.post('/create-meeting', createMeeting);
app.post('/get-meeting', getMeeting);
app.put('/update-meeting/:id',updateMeeting)



const instagramSchemaa = new mongoose.Schema({
  username: String,
  id: String,
  media_type: String,
  media_url: String,
  thumbnail_url: String,
  permalink: String,
  caption: String,
  timestamp: Date,
  media_items: [
    {
      media_type: String,
      media_url: String,
      thumbnail_url: String,
    },
  ],
});

const Instagramss = mongoose.model('Instagramss', instagramSchemaa);  // Use 'Instagramss' as the model name

app.get('/getSaveInstagram', async (req, res) => {
  const accessToken = process.env.INSTAGRAM_API_ACCESS_TOKEN;
  const pageSize = 50; // Adjust the page size as needed

  try {
    // Fetch user profile to get the username
    const profileOptions = {
      method: 'GET',
      url: `https://graph.instagram.com/v12.0/me?fields=username&access_token=${accessToken}`,
    };

    const profileResponse = await axios(profileOptions);
    const { username } = profileResponse.data;

    let allPosts = [];
    let nextUrl = `https://graph.instagram.com/v12.0/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{media_type,media_url,thumbnail_url}&access_token=${accessToken}&limit=${pageSize}`;

    while (nextUrl) {
      const mediaResponse = await axios({ method: 'GET', url: nextUrl });
      const data = mediaResponse.data;

      if (!data.data || !Array.isArray(data.data)) {
        break;
      }

      allPosts = allPosts.concat(data.data);

      // Check for pagination
      nextUrl = data.paging && data.paging.next;
    }

    const processedData = processCarouselPosts({ data: allPosts }, username);

    // Save processed data to the database
    await saveToDatabase({ data: allPosts });

    res.json(processedData);
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    res.status(500).send('Internal Server Error');
  }
});

function processCarouselPosts(data, username) {
  if (!data.data || !Array.isArray(data.data)) {
    return data;
  }

  data.data.forEach((post) => {
    if (
      post.media_type === 'CAROUSEL_ALBUM' &&
      post.children &&
      Array.isArray(post.children.data)
    ) {
      post.media_type = 'CAROUSEL';
      post.media_items = post.children.data;
      delete post.children;
    }

    post.username = username; // Add the username to the processed data
  });

  return data;
}

async function saveToDatabase(data) {
  if (!data.data || !Array.isArray(data.data)) {
    return;
  }

  for (const post of data.data) {
    try {
      const existingPost = await Instagramss.findOne({ timestamp: post.timestamp });

      if (!existingPost) {
        const instagramInstance = new Instagramss({
          username: post.username,
          id: post.id,
          media_type: post.media_type,
          media_url: post.media_url,
          thumbnail_url: post.thumbnail_url,
          permalink: post.permalink,
          caption: post.caption,
          timestamp: new Date(post.timestamp),
          media_items: post.media_items,
        });

        await instagramInstance.save();
      } else {
        console.log(`Duplicate entry found for timestamp ${post.timestamp}. Skipping.`);
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }
}




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

// instagram hikayeler

const storySchema = new mongoose.Schema({
  id: String,
  media_type: String,
  media_url: String,
  thumbnail_url: String,
  timestamp: Date,
  username: String,
});

// MongoDB için bir model oluşturun
const InstagramStory = mongoose.model('InstagramStory', storySchema);

app.get('/getSaveInstagramStories', async (req, res) => {
  const accessToken = process.env.INSTAGRAM_API_ACCESS_TOKEN;

  try {
    const storiesResponse = await axios.get(`https://graph.instagram.com/v12.0/me/stories?access_token=${accessToken}`);
    const storiesData = storiesResponse.data;

    if (!storiesData.data || !Array.isArray(storiesData.data)) {
      return res.status(500).json({ error: 'Invalid response from Instagram API' });
    }

    const username = storiesData.data[0]?.owner?.username || 'unknown';

    // Save each story to the database
    for (const story of storiesData.data) {
      const existingStory = await InstagramStory.findOne({ id: story.id });

      if (!existingStory) {
        const instagramStoryInstance = new InstagramStory({
          id: story.id,
          media_type: story.media_type,
          media_url: story.media_url,
          thumbnail_url: story.thumbnail_url,
          timestamp: new Date(story.taken_at_timestamp * 1000), // Convert seconds to milliseconds
          username: username,
        });

        await instagramStoryInstance.save();
      } else {
        console.log(`Duplicate entry found for story ID ${story.id}. Skipping.`);
      }
    }

    res.json({ success: true, message: 'Instagram stories saved to the database.' });
  } catch (error) {
    console.error('Error fetching Instagram stories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



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
// <!-- // instagram -->