import { offer } from "./Offer.js";

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
      const leagueType = offer.find((match) => match.id === odds[odd].id).sport_key;
      console.log(leagueType);
      const leagueOddsList = await sendReq(leagueType);
      const singleOdd = leagueOddsList.find((match) => match.id === odds[odd].id);
      odds[odd].scores = singleOdd.scores;
      odds[odd].completed = singleOdd.completed;
    }
  }

  static updateFactors() {
    console.log('in factors', odds);
    for (let odd in odds) {
      const oddId = odds[odd].id;
      const bookmaker = offer
        .find((match) => match.id === oddId)
        .bookmakers.find((bookmacher) => bookmacher.key === odds[odd].bookmacherId);
      switch (odds[odd].userChoice) {
        case "1":
          odds[odd].factor = +bookmaker.markets[0].outcomes[0].price;
          break;
        case "2":
          odds[odd].factor = +bookmaker.markets[0].outcomes[1].price;
          break;
        case "draw":
          odds[odd].factor = +bookmaker.markets[0].outcomes[2].price;
          break;
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
