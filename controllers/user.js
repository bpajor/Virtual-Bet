import axios from "axios";
import { User, activeUser } from "../models/user.js";
import { API_KEY } from "../helpers/api-key.js";
import { Offer, offer } from "../models/Offer.js";
import { Odd } from "../models/Odd.js";

export const getHomePage = (req, res, next) => {
  const uid = req.params.userId;
  axios
    .get("https://react-http-662b7-default-rtdb.firebaseio.com/.json")
    .then((response) => {
      const { Users } = response.data;
      const isUserLoggedIn = activeUser.uid === uid;
      activeUser.authorizeUser(uid, Users, isUserLoggedIn, async () => {
        if (isUserLoggedIn) {
          const dateResponse = await axios.get(
            "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable/previousRequestDate.json"
          );
          const prevRequestDate = new Date(dateResponse.data);
          const currentDate = new Date();
          if (
            offer === undefined ||
            (currentDate - prevRequestDate) / (1000 * 60) > 5
          ) {
            await Offer.sendHourlyRequest(async () => {
              try {
                const res = await axios.get(
                  `https://api.the-odds-api.com/v4/sports/soccer/odds?apiKey=${API_KEY}&regions=eu&markets=h2h&dateFormat=iso&oddsFormat=decimal`
                );
                try {
                  const response = await axios.put(
                    "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable.json",
                    { offers: res.data, previousRequestDate: new Date() }
                  );
                } catch (error) {
                  console.log(error);
                }
              } catch (error) {
                console.log("get from API error");
                //TODO: Handle error page (offer not available)
              }
            });
          }
          try {
            const resp = await axios.get(
              "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable/offers.json"
            );
            await Offer.setOffer(resp.data);
            res.render("user/home-page", {
              uid: uid,
              username: activeUser.name,
              walletAmount: activeUser.walletAmount,
              offers: offer,
            });
          } catch (error) {
            console.log(error);
          }
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

export const getOdds = async (req, res, next) => {
  const oddsResponse = await axios.get(`https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds.json`);
  const odds = oddsResponse.data;
  res.render("user/odds-page", { uid: activeUser.uid, odds});
};

export const postOdd = async (req, res, next) => {
  const userChoice = req.body.select;
  const oddAmount = req.body.amount;
  const offerId = req.query.offerId;
  const bookmacherId = req.query.bookmacherId;
  console.log('offerId: ', offerId);
  const uid = req.params.userId;

  const odd = new Odd(offerId, userChoice, oddAmount, bookmacherId);
  const leagueType = odd.findLeagueType();
  // const leagueType = odd.findLeagueType();

  try {
    const match = await odd.findMatch(async () => {
      const res = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${leagueType}/scores?apiKey=e4afa8b45e5d32053f1202b125cc2916&daysFrom=3`
      );

      return res.data;
    });

    try {
      const patchResp = await axios.patch(
        `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds/${offerId}.json`,
        odd
      );
    } catch (error) {
      console.log("error patching match data");
    }
  } catch (error) {
    console.log("error getting scores");
    //TODO: render error page
  }

  res.redirect(`/user/${uid}/odds`);
};
