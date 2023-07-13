import express from 'express';
import { getHomePage, postLogout, patchPayment, getOdds, postOdd, deleteOdd } from '../controllers/user.js';

export const router = express.Router();

router.delete('/user/:userId/odds/delete', deleteOdd)

router.post('/user/logout', postLogout);

router.patch('/user/payment/', patchPayment);

router.get('/user/:userId/odds', getOdds);

router.post('/user/:userId/odd', postOdd);

router.get('/user/:userId', getHomePage);
