export let activeUser = null;

export class User {        
    constructor(uid) {
        this.uid = uid
    }

    static setActiveUser(user) {
        activeUser = user;
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
        cb();
    }

    // setName(name) {
    //     this.name = name;
    // }

    // setWalletAmount(amount) {
    //     this.walletAmount = amount;
    // }

    // setKey(key) {
    //     this.key = key;
    // }
}