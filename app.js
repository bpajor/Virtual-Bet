import {getDatabase, ref, child, get} from "firebase/database";
import {initializeApp} from "firebase/app"
import firebase from "firebase/compat/app";
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { router as loginRoutes } from "./routes/login.js";
import { router as userRoutes } from "./routes/user.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const firebaseConfig = {
    apiKey: "AIzaSyC9i4I3xV_Kttku82BeOHQnYKGjh2uGB1Y",
    authDomain: "https://react-http-662b7-default-rtdb.firebaseio.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "react-http-662b7",
};

const API_KEY = "734fc7bd4866713b585f5a3c0439b156";
// const path = require("path");

const app = express();
app.use(express.json());
// const axios = require("axios");
// const bodyParser = require("body-parser");


firebase.initializeApp(firebaseConfig);

app.set("view engine", "ejs");
app.set("views", "views");

// const loginRoutes = require("./routes/login");
// const userRoutes = require("./routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(loginRoutes);
app.use(userRoutes);

app.listen(3000);
