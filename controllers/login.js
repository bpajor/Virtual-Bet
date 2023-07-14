// const firebase = require("firebase/compat/app")
// require("firebase/compat/auth")
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { User, activeUser } from '../models/user.js';
// import * as auth from "firebase/compat/auth"

export const getDefault = (req, res, next) => {
    res.redirect('/login');
}

export const getLogin = (req, res, next) => {
    res.render("login/login-page", {pageTitle: 'Login Page', badLogin: false, incorrectUID: false})
}

export const postLogin = (req, res, next) => {
    const email = req.body.username;
    const password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
        const uid = userCredential.user.uid;
        const user = new User(uid);
        User.setActiveUser(user);
        res.redirect(`/user/${uid}`)
    }).catch(error => {
        res.render('login/login-page', {pageTitle: 'Login Page', badLogin: true, incorrectUID: false})
    })
}