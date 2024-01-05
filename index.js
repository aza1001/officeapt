const express = require('express')
const mongodb = require('mongodb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()

app.use(express.json())

const port = process.env.PORT || 3000;
const secretKey = 'officeapt';

// MongoDB connection URL with username & password
const mongoURL =
  'mongodb+srv://aza:mongoaza@officevms.tilw1nt.mongodb.net/?retryWrites=true&w=majority';

// MongoDB database and collections names
const dbName = 'officevms';
const staffCollection = 'staff';
const securityCollection = 'security';
const appointmentCollection = 'appointments';

// Middleware for parsing JSON data
app.use(express.json());

// MongoDB connection
mongodb.MongoClient.connect(mongoURL, { useUnifiedTopology: true })
  .then((client) => {
    const db = client.db(dbName);
    staffDB = db.collection(staffCollection);
    securityDB = db.collection(securityCollection);
    appointmentDB = db.collection(appointmentCollection);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Middleware for authentication and authorization
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Invalid or unauthorized token');
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid or expired token');
    }
    req.user = user;
    next();
  });
};

const options = {
  definition: {
      openapi: '3.0.0',
      info: {
          title: 'AZFA Sdn. Bhd. Office Appointment',
          version: '1.0.0',
          description: "Group 13 Developer: \n -Norazizah Binti Zainal Abidin (B022110149) \n -Norfadhila Binti Mohd Azian (B022110143)"
      },
  },
  apis: ['./index.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
   })   

app.get('/', (req, res) => {
 res.send('Hello World!')
})

