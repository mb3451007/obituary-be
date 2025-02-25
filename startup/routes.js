const express = require('express');
require('express-async-errors');
const cors = require('cors');
const path = require('path');

const auth = require('../routers/auth.route');
const user = require('../routers/user.route');
const obituary = require('../routers/obituary.route');
const error = require('../middlewares/error');

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
  methods: 'POST,GET,PATCH,DELETE',
  allowedHeaders: ['Content-Type', 'access-token', 'refresh-token'],
  exposedHeaders: ['access-token', 'refresh-token'],
  optionsSuccessStatus: 200,
};

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(
    '/api/obituaryUploads',
    express.static(path.join(__dirname, '..', 'obituaryUploads'))
  );
  app.use('/api/auth', auth);
  app.use('/api/user', user);
  app.use('/api/obituary', obituary);
  app.use(error);
};
