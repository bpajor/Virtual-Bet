import express from 'express';
import { getHomePage, postLogout, patchPayment } from '../controllers/user.js';

export const router = express.Router();

// const userController = require('../controllers/user');

router.post('/user/logout', postLogout);

// router.post('/user/payment', postPayment);

router.patch('/user/payment/', patchPayment);

router.get('/user/:userId', getHomePage);

// module.exports = router;