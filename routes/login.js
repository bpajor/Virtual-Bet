import  express  from 'express';
import { getDefault, getLogin, postLogin } from '../controllers/login.js';

export const router = express.Router();

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/', getDefault);
