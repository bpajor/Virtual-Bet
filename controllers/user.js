import axios from "axios";
import { User, activeUser } from "../models/user.js";
import { API_KEY } from "../helpers/api-key.js";

export const getHomePage = (req, res, next) => {
  const uid = req.params.userId;
  axios
    .get("https://react-http-662b7-default-rtdb.firebaseio.com/.json")
    .then((response) => {
      const { Users, MatchesAvailable } = response.data;
      const isUserLoggedIn = activeUser.uid === uid;
      activeUser.authorizeUser(uid, Users, isUserLoggedIn, async () => {
        if (isUserLoggedIn) {
          try {
            const res = await axios.get(
              `https://api.the-odds-api.com/v4/sports/soccer/odds?apiKey=${API_KEY}&regions=us&markets=h2h&dateFormat=iso&oddsFormat=decimal`
            );
            try {
              const response = await axios.patch(
                "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable.json",
                { offers: res.data }
              );
            } catch (error) {
              console.log(error);
            }
          } catch (error) {
            console.log(error);
          }

          let offers = null;
          try {
            const res = await axios.get(
              "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable/offers.json"
            );
            offers = [...res.data];
          } catch (error) {
            console.log(error);
            offers = null;
          }
          console.log(offers);
          res.render("user/home-page", {
            username: activeUser.name,
            walletAmount: activeUser.walletAmount,
            offers: offers,
          });
        } else {
          res.render("login/login-page", {
            pageTitle: "login",
            incorrectUID: true,
            badLogin: false,
          });
        }
      });
    })
    .catch((error) => {
      res.render("login/login-page", {
        pageTitle: "login",
        incorrectUID: true,
        badLogin: false,
      });
    });
};

export const postLogout = (req, res, next) => {
  User.setActiveUser(null);
  res.redirect("/login");
};

export const patchPayment = (req, res, next) => {
  const inputWalletAmount = +req.body.amount;
  const prevWalletAmount = +activeUser.walletAmount;
  const walletAmountToPatch = inputWalletAmount + prevWalletAmount;

  axios
    .patch(
      `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`,
      { walletAmount: walletAmountToPatch }
    )
    .then(() => {
      res.redirect(`${activeUser.uid}`);
    })
    .catch((error) => {
      console.log("error patching data");
    });
};
