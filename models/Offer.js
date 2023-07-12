export let offer = undefined;

export class Offer {
  static setOffer(inputOffer) {
    offer = [...inputOffer];
  }

  static sendHourlyRequest(cb) {
    cb();
  }
}
