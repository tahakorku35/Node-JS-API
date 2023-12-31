const express = require('express');
const bodyParser = require('body-parser');
const nodeMailer = require("nodemailer");
const https = require('https');
const request = require('request');
const axios = require('axios');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');

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
  const pageSize = 50; 

  try {
    // kullanıcı adı getirme
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

      
      nextUrl = data.paging && data.paging.next;
    }

    const processedData = processCarouselPosts({ data: allPosts }, username);

    // gelen verileri kaydetme
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

    post.username = username; 
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

// instagram post çekme kod bitişi




// instagram reels videolar
const reelSchema = new mongoose.Schema({
  id: String,
  media_type: String,
  media_url: String,
  thumbnail_url: String,
  permalink: String,
  caption: String,
  timestamp: Date,
  username: String,
});

const Reel = mongoose.model('Reel', reelSchema);
const cache = new NodeCache({ stdTTL: 300 });

// Express route to fetch and save Instagram reels
app.get('/getSaveInstagramReels', async (req, res) => {
  const accessToken = process.env.INSTAGRAM_API_ACCESS_TOKEN; // Replace with your Instagram API access token

  try {
    // Check if MongoDB connection is open
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not open.');
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Fetch Instagram profile data to get the username
    const profileResponse = await axios.get(`https://graph.instagram.com/v12.0/me?fields=username&access_token=${accessToken}`);
    const username = profileResponse.data.username;

    let nextUrl = `https://graph.instagram.com/v12.0/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp&access_token=${accessToken}&limit=100`;
    const savedReels = [];

    // Fetch reels data from Instagram API with pagination
    while (nextUrl) {
      const reelsResponse = await axios.get(nextUrl);
      const reelsData = reelsResponse.data;

      // Check if the response contains valid data
      if (!reelsData.data || !Array.isArray(reelsData.data)) {
        return res.status(500).json({ error: 'Invalid response from Instagram API' });
      }

      // Save each reel to the database
      for (const reel of reelsData.data) {
        // Only consider "VIDEO" media type content
        if (reel.media_type === 'VIDEO') {
          try {
            // Handle different timestamp formats
            const timestamp = reel.timestamp ? (reel.timestamp < 10000000000 ? new Date(reel.timestamp * 1000) : new Date(reel.timestamp)) : null;

            console.log('Reel ID:', reel.id, 'Timestamp:', reel.timestamp, 'Formatted Timestamp:', timestamp);

            if (timestamp instanceof Date && !isNaN(timestamp)) {
              const existingReel = await Reel.findOne({ id: reel.id });

              if (!existingReel) {
                const reelInstance = new Reel({
                  id: reel.id,
                  media_type: reel.media_type,
                  media_url: reel.media_url,
                  thumbnail_url: reel.thumbnail_url,
                  permalink: reel.permalink,
                  caption: reel.caption,
                  timestamp: timestamp,
                  username: username,
                });

                const savedReel = await reelInstance.save();
                savedReels.push(savedReel);
              } else {
                console.log(`Duplicate entry found for reel ID ${reel.id}. Skipping.`);
              }
            } else {
              console.log(`Invalid timestamp found for reel ID ${reel.id}. Skipping.`);
            }
          } catch (saveError) {
            console.error('Error saving reel to the database:', saveError);
            return res.status(500).json({ error: 'Error saving reel to the database', details: saveError.message });
          }
        }
      }

      nextUrl = reelsData.paging && reelsData.paging.next ? reelsData.paging.next : null;
    }

    // Save data to cache
    cache.set('reels', savedReels);

    res.json({ success: true, message: 'Instagram reels saved to the database.' });
  } catch (error) {
    console.error('Error fetching or saving Instagram reels:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// instagram reels videolar



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
// <!-- // instagram -->