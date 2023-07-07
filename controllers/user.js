import axios from "axios";
import { User, activeUser } from "../models/user.js";

export const getHomePage = (req, res, next) => {
  const uid = req.params.userId;
  axios
    .get("https://react-http-662b7-default-rtdb.firebaseio.com/Users.json")
    .then((response) => {
      const data = response.data;
      const isUserLoggedIn = activeUser.uid === uid;
      if (isUserLoggedIn) {
        // let loggedUser = null;
        for (let user in data) {
          if (data[user].uid === uid) {
            // loggedUser = data[user];
            activeUser.setKey(user);
            activeUser.setName(data[user].Name);
            activeUser.setWalletAmount(data[user].walletAmount);
            break;
          }
        }
        res.render("user/home-page", {
          username: activeUser.name,
          walletAmount: activeUser.walletAmount,
        });
      } else {
        res.render("login/login-page", {
          pageTitle: "login",
          incorrectUID: true,
          badLogin: false,
        });
      }
    })
    .catch((error) => {
      console.log('active user: ', activeUser);
      res.render("login/login-page", {
        pageTitle: "login",
        incorrectUID: true,
        badLogin: false,
      });
      // console.log(error);
      // res.redirect(`/user/${uid}`);
    });
};

export const postLogout = (req, res, next) => {
  User.setActiveUser(null);
  res.redirect("/login");
};

// export const postPayment = (req, res, next) => {
//   console.log(req.body.amount);
  
// }

export const patchPayment = (req, res, next) => {
  const inputWalletAmount = req.body.amount;
  const prevWalletAmount = activeUser.walletAmount;
  const walletAmountToPatch = +inputWalletAmount + +prevWalletAmount;

  axios
    .patch(
      `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`, {walletAmount: walletAmountToPatch}
    )
    .then(() => {
      res.redirect(`${activeUser.uid}`);
    })
    .catch((error) => {
      console.log("error patching data");
    });
};
