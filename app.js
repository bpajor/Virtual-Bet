import firebase from "firebase/compat/app";
import express from "express";
import bodyParser from "body-parser";
import { router as loginRoutes } from "./routes/login.js";
import { router as userRoutes } from "./routes/user.js";
import path from "path";
import { fileURLToPath } from "url";
import { activeUser } from "./models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyC9i4I3xV_Kttku82BeOHQnYKGjh2uGB1Y",
  authDomain: "https://react-http-662b7-default-rtdb.firebaseio.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "react-http-662b7",
};

const app = express();
app.use(express.json());

firebase.initializeApp(firebaseConfig);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(loginRoutes);
app.use(userRoutes);

app.use((req, res, next) => {
  if (activeUser) {
    res.status(404).render('error/error-page', {isUserActive: true, uid: activeUser.uid})
  }
  res.status(404).render('error/error-page', {isUserActive: false})
});

const port = process.env.PORT || 3000;

app.listen(port);
