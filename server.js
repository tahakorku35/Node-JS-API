const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const app = express();
const env = require('dotenv').config();
const connectDB = require('./config/db');
const qr = require("qrcode"); 
const Iyzipay = require('iyzipay');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let data = "https://unixcybervpn.com/";

qr.toDataURL(data, function(err, code) {
  if (err) {
    console.log("Error:", err);
    return;
  }
  // console.log(code); 
});

const iyzipay = new Iyzipay({
  apiKey: 'sandbox-QeR7J7iJIkSdBbnxzc2vELqAGoPeehkv',
  secretKey: 'sandbox-l6EKpeaaGPjz2rwLx5PjKlkpsP0ziE5r',
  uri: 'https://sandbox-api.iyzipay.com'
});


async function pay(req, res) {
  try {
    const { cardHolderName, cardNumber, expireMonth, expireYear, cvc } = req.body;

    const request = {
      currency: Iyzipay.CURRENCY.USD, // Change the currency to US Dollars (USD)
      conversationId: '123456789',
      price: '1000', // Update the total price to $1000
      paidPrice: '1000', // Update the paid price to $1000
      currency: Iyzipay.CURRENCY.USD, // Change the currency to USD
      installment: '1', // Taksit kullanılmayacak
      basketId: 'B67832',
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
      },
      buyer: {
        id: 'BY789',
        name: 'John',
        surname: 'Doe',
        gsmNumber: '+905350000000',
        email: 'email@email.com',
        identityNumber: '74300864791',
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732',
      },
      shippingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742',
      },
      billingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742',
      },
      basketItems: [
        {
          id: 'BI101',
          name: 'Binocular',
          category1: 'Collectibles',
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: '1000', // Update the product price to $1000
        },
      ],
    };

    iyzipay.payment.create(request, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.status === 'success') {
        return res.status(200).json({ status: 'success', message: 'Ödeme başarılı' });
      } else {
        return res.status(500).json({ status: 'error', message: 'Ödeme başarısız', error: result.errorMessage });
      }
    });
  } catch (e) {
    res.status(500).send(`İşlem Başarısız ${e}`);
  }
}

app.post('/pay',pay)




const Router = require('./routes/users');

const { userRegisterValidationRules, userLoginValidationRules, handleInputErrors } = require('./modules/middleware');
const { registerUser, loginUser, getUserList, newPasswordUser, logoutUser, deleteUser, updatePasswordUser } = require('./handlers/user_handler');
const { protect } = require('./modules/auth');

// Port tanımlaması
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/api', protect, Router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});


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
