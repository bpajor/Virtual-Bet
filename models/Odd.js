import { offer } from "./Offer.js";

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
    //TODO fix factor
  }

  findLeagueType() {
    const leagueType = offer.find((match) => match.id === this.oddId).sport_key;
    return leagueType;
  }

  async findMatch(getLeagueMatches) {
    const leagueMatches = await getLeagueMatches();
    const match = leagueMatches.find((match) => match.id === this.oddId);
    for (let key in match) {
      this[key] = match[key];
    }
  }
}
