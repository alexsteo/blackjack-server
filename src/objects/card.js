
class Card {
    constructor (suit, sign) {
        this.suit = suit;
        this.sign = sign;
        this.value = this.calculateCardValue(sign);
    }

    calculateCardValue(sign) {
        let val = parseInt(sign);
        if(!isNaN(val)) {
            return val;
        }
        if(["J", "Q", "K"].includes(sign)) {
            return 10;
        }
        if(sign === "A"){
            return 11;
        }
        return 0 //should not happen
    }

    show() {
        return this.sign + "of" + this.suit;
    }
}

module.exports = {
    Card
}
