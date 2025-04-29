const express = require('express');
const cors = require('cors');
const db = require('./db');
const router = require('./router/router')
db();
require('dotenv').config();
const app = express();
const port = 10000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));





app.use('/', router);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




