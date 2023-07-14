import { odds } from "./Odd.js";

export let offer = undefined;

export class Offer {
  static setOffer(inputOffer) {
    offer = [...inputOffer];
  }

  static reduceOfferFromOdds() {
    let offers = [...offer];
    for (let odd in odds) {
      offers = offers.filter(offer => offer.id !== odd)
    }

    return offers;
  }
}
