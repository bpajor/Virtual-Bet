export let activeUser = null;

export class User {
  constructor(uid) {
    this.uid = uid;
  }

  static setActiveUser(user) {
    activeUser = user;
  }

  static async upgradeUserWallet(amount, sendReq) {
    const newAmount = (+activeUser.walletAmount + +amount).toFixed(2);
    activeUser.walletAmount = newAmount;

    await sendReq(newAmount);
  }

  authorizeUser(uid, data, isUserLoggedIn, cb) {
    if (isUserLoggedIn) {
      for (let user in data) {
        if (data[user].uid === uid) {
          this.key = user;
          this.name = data[user].Name;
          this.walletAmount = data[user].walletAmount;
          break;
        }
      }
    }
  }
}
