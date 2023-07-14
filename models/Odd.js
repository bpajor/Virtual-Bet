import { offer } from "./Offer.js";
import { User } from "./user.js";

export let odds = undefined;

export class Odd {
  constructor(oddId, userChoice, oddAmount, bookmacherId) {
    this.oddId = oddId;
    this.userChoice = userChoice;
    this.oddAmount = oddAmount;
    this.bookmacherId = bookmacherId;
    const bookmaker = offer
      .find((match) => match.id === this.oddId)
      .bookmakers.find((bookmacher) => bookmacher.key === bookmacherId);
    this.bookmakerName - bookmaker.key;
    switch (this.userChoice) {
      case "1":
        this.factor = +bookmaker.markets[0].outcomes[0].price;
        break;
      case "2":
        this.factor = +bookmaker.markets[0].outcomes[1].price;
        break;
      case "draw":
        this.factor = +bookmaker.markets[0].outcomes[2].price;
        break;
    }
  }

  static deleteOdd(oddId) {
    delete odds[oddId];
  }

  findLeagueType() {
    const leagueType = offer.find((match) => match.id === this.oddId).sport_key;
    return leagueType;
  }

  static async updateCompletedAndScores(sendReq) {
    for (let odd in odds) {
      const leagueType = odds[odd].sport_key;
      const leagueOddsList = await sendReq(leagueType);
      if (!leagueOddsList) {
        return;
      }
      const singleOdd = leagueOddsList.find(
        (match) => match.id === odds[odd].id
      );
      odds[odd].scores = singleOdd.scores;
      odds[odd].completed = singleOdd.completed;
    }
  }

  static async checkWalletAmountUpdateNeccessary(updateWalletReq, updateWalletUpdated) {
    for (let odd in odds) {
      let isWin = false;
      if (odds[odd].completed && !odds[odd].walletUpdated) {
        switch (odds[odd].userChoice) {
          case "1":
            isWin = +odds[odd].scores[0].score > +odds[odd].scores[1].score;
            break;

          case "2":
            isWin = +odds[odd].scores[0].score < +odds[odd].scores[1].score;
            break;

          case "draw":
            isWin = +odds[odd].scores[0].score === +odds[odd].scores[1].score;
            break;
        }
        if (isWin) {
          await User.upgradeUserWallet(
            (+odds[odd].oddAmount * +odds[odd].factor).toFixed(2),
            updateWalletReq
          );

          await updateWalletUpdated(odds[odd].oddId);
          odds[odd].walletUpdated = true;
        }
      }
    }
  }

  async findMatch(getLeagueMatches) {
    const leagueMatches = await getLeagueMatches();
    const match = leagueMatches.find((match) => match.id === this.oddId);
    for (let key in match) {
      this[key] = match[key];
    }
  }

  static addOdd(offerId, inputOdd) {
    odds[offerId] = inputOdd;
  }

  static setOdds(inputOdds) {
    odds = { ...inputOdds };
  }
}
