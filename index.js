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
  'mongodb+srv://aza:0ff1ce4ptm3nt@officevms.tilw1nt.mongodb.net/?retryWrites=true&w=majority';

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

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* tags:
*   name: Security
*   description: APIs accessible only by security personnel
*/

/**
* @swagger
* tags:
*   name: Staff
*   description: APIs accessible only by staff members
*/

/**
* @swagger
* tags:
*   name: Testing API
*   description: APIs for testing only (will not be saved into the main database)
*/

/**
* @swagger
* /register-staff:
*   post:
*     summary: Register staff
*     tags: [Security]
*     security:
*       - bearerAuth: []
*     requestBody:
*       content:
*         application/json:
*           schema: 
*             type: object
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: Staff registered successfully
*       403:
*         description: Invalid or unauthorized token
*       409:
*         description: Username already exists
*       500:
*         description: Error registering staff
*/

// Register staff
app.post('/register-staff', authenticateToken, async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'security') {
      return res.status(403).send('Invalid or unauthorized token');
    }
  
    const { username, password } = req.body;
  
    const existingStaff = await staffDB.findOne({ username });
  
    if (existingStaff) {
      return res.status(409).send('Username already exists');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const staff = {
      username,
      password: hashedPassword,
    };
  
    staffDB
      .insertOne(staff)
      .then(() => {
        res.status(200).send('Staff registered successfully');
      })
      .catch((error) => {
        res.status(500).send('Error registering staff');
      });
  });
  
  /**
  * @swagger
  * /register-security:
  *   post:
  *     summary: Register security
  *     tags: [Security]
  *     requestBody:
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               username:
  *                 type: string
  *               password:
  *                 type: string
  *     responses:
  *       200:
  *         description: Security registered successfully
  *       409:
  *         description: Username already exists
  *       500:
  *         description: Error registering security
  */
  
  // Register security
  app.post('/register-security', async (req, res) => {
    const { username, password } = req.body;
  
    const existingSecurity = await securityDB.findOne({ username });
  
    if (existingSecurity) {
      return res.status(409).send('Username already exists');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const security = {
      username,
      password: hashedPassword,
    };
  
    securityDB
      .insertOne(security)
      .then(() => {
        res.status(200).send('Security registered successfully');
      })
      .catch((error) => {
        res.status(500).send('Error registering security');
      });
  });
  