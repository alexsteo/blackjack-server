
class Player {
    constructor(username, conId) {
        this.username = username;
        this.conId = conId;
        this.hand = [];
        this.score = 0;
        this.stays = false;
        this.wantsNextGame = false;
    }

    calculateScore() {
        this.score = this.hand.sort((a, b) => a.value - b.value).reduce((acc, current) => {
            if (current.value === 11 && acc >= 11) {
                return acc + 1;
            } else {
                return acc + current.value;
            }
        }, 0);
    }

    nextGame() {
        this.hand = [];
        this.score = 0;
        this.stays = false;
        this.wantsNextGame = false;
    }
}

module.exports = {
    Player,
}
