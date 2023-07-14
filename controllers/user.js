import axios from "axios";
import { User, activeUser } from "../models/user.js";
import { API_KEY } from "../helpers/api-key.js";
import { Offer } from "../models/Offer.js";
import { Odd, odds } from "../models/Odd.js";

export const getHomePage = async (req, res, next) => {
  const uid = req.params.userId;

  try {
    const response = await axios.get(
      "https://react-http-662b7-default-rtdb.firebaseio.com/.json"
    );

    const { Users } = response.data;
    const isUserLoggedIn = activeUser.uid === uid;

    if (isUserLoggedIn) {
      activeUser.authorizeUser(uid, Users, isUserLoggedIn);

      const oddsResp = await axios.get(
        `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds.json`
      );
      Odd.setOdds(oddsResp.data);

      console.log("Updating scores and checking wallet...");
      await Promise.all([
        Odd.updateCompletedAndScores(async (leagueType) => {
          const res = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${leagueType}/scores?apiKey=${API_KEY}&daysFrom=3`
          );

          return res.data;
        }),

        Odd.checkWalletAmountUpdateNeccessary(
          async (newAmount) => {
            await axios.patch(
              `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`,
              { walletAmount: +newAmount }
            );
          },
          async (offerId) => {
            await axios.patch(
              `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds/${offerId}.json`,
              { walletUpdated: true }
            );
          }
        ),
      ]);

      try {
        console.log("Getting offers...");
        const ress = await axios.get(
          `https://api.the-odds-api.com/v4/sports/soccer/odds?apiKey=${API_KEY}&regions=eu&markets=h2h&dateFormat=iso&oddsFormat=decimal`
        );

        console.log("Saving offers...");
        const response = await axios.put(
          "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable.json",
          { offers: ress.data }
        );

        console.log("Getting saved offers...");
        const resp = await axios.get(
          "https://react-http-662b7-default-rtdb.firebaseio.com/MatchesAvailable/offers.json"
        );

        Offer.setOffer(resp.data);
      } catch (error) {
        console.log("Error occurred while handling offers:", error);
      }

      const offers = Offer.reduceOfferFromOdds();

      console.log("Rendering home page...");
      res.render("user/home-page", {
        uid: uid,
        username: activeUser.name,
        walletAmount: activeUser.walletAmount,
        offers,
      });
    } else {
      res
        .status(401)
        .render("user/not-authorised-page", { uid: activeUser.uid });
    }
  } catch (error) {
    console.log("Error occurred:", error);
    try {
      console.log("Attempting to render error page...");
      res.status(503).render("user/server-error-page", { uid: activeUser.uid });
    } catch (err) {
      console.error("Error while sending error page:", err);
      res.status(500).end();
    }
  }
};

export const postLogout = (req, res, next) => {
  User.setActiveUser(null);
  res.redirect("/login");
};

export const patchPayment = async (req, res, next) => {
  const inputWalletAmount = +req.body.amount;

  await User.upgradeUserWallet(inputWalletAmount, async (newAmount) => {
    try {
      await axios.patch(
        `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`,
        { walletAmount: +newAmount }
      );
    } catch (error) {
      res.status(503).render("user/server-error-page", { uid: activeUser.uid });
    }
  });
};

export const getOdds = async (req, res, next) => {
  const urlUid = req.params.userId;
  if (urlUid === activeUser.uid) {
    try {
      const resp = await axios.put(
        `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds.json`,
        odds
      );
    } catch (error) {
      res.status(503).render("user/server-error-page", { uid: activeUser.uid });
    }
    res.render("user/odds-page", { uid: activeUser.uid, odds });
  } else {
    res.status(401).render("user/not-authorised-page", { uid: activeUser.uid });
  }
};

export const postOdd = async (req, res, next) => {
  const userChoice = req.body.select;
  const oddAmount = req.body.amount;
  const offerId = req.query.offerId;
  const bookmacherId = req.query.bookmacherId;
  const uid = req.params.userId;

  const odd = new Odd(offerId, userChoice, oddAmount, bookmacherId);
  const leagueType = odd.findLeagueType();

  try {
    const match = await odd.findMatch(async () => {
      const res = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${leagueType}/scores?apiKey=${API_KEY}&daysFrom=3`
      );

      return res.data;
    });

    try {
      const patchResp = await axios.patch(
        `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds/${offerId}.json`,
        odd
      );
      await User.upgradeUserWallet(-oddAmount, async (newAmount) => {
        try {
          await axios.patch(
            `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`,
            { walletAmount: +newAmount }
          );
        } catch (error) {
          throw error;
        }
      });
      Odd.addOdd(offerId, odd);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    res.status(503).render("user/server-error-page", { uid: activeUser.uid });
  }

  res.redirect(`/user/${uid}/odds`);
};

export const deleteOdd = async (req, res, next) => {
  const oddAmount = req.query.oddAmount;
  const oddId = req.query.oddId;

  if (oddAmount) {
    await User.upgradeUserWallet(oddAmount, async (newAmount) => {
      try {
        await axios.patch(
          `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}.json`,
          { walletAmount: +newAmount }
        );
      } catch (error) {
        res
          .status(503)
          .render("user/server-error-page", { uid: activeUser.uid });
      }
    });
  }

  Odd.deleteOdd(oddId);

  try {
    await axios.delete(
      `https://react-http-662b7-default-rtdb.firebaseio.com/Users/${activeUser.key}/Odds/${oddId}.json`
    );
  } catch (error) {
    res.status(503).render("user/server-error-page", { uid: activeUser.uid });
  }
};
