export let activeUser = null;

export class User {        
    constructor(uid) {
        this.uid = uid
    }

    static setActiveUser(user) {
        activeUser = user;
    }

    setName(name) {
        this.name = name;
    }

    setWalletAmount(amount) {
        this.walletAmount = amount;
    }

    setKey(key) {
        this.key = key;
    }
}