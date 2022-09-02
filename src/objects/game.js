const {Card} = require("./card");

const suits = ["H", "C", "D", "S"];
const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

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

class Game {
    constructor(players) {
        this.players = players;
        this.deck = this.createDeck();
        this.discarded = [];
    }

    nextGame() {
        this.players.forEach(player => player.nextGame());
    }

    getPlayerById(conId) {
        return this.players.filter(player => player.conId === conId)[0];
    }

    checkWinner() {
        this.players.forEach(player => player.calculateScore());
        if(this.players[0].score <= 21) {
            if(this.players[1].score <= 21) {
                if(this.players[0].score === this.players[1].score) {
                    return null
                } else {
                    return (this.players[0].score > this.players[1].score) ? this.players[0].conId : this.players[1].conId;
                }
            } else {
                return this.players[0].conId;
            }
        } else {
            if(this.players[1].score <= 21) {
                return this.players[1].conId;
            } else {
                return null;
            }
        }
    }

    draw(userId) {
        if(this.deck.length > 0) {
            this.players.filter(player => player.conId === userId)[0].hand.push(this.deck.pop());
        } else {
            this.shuffle();
            this.players.filter(player => player.conId === userId)[0].hand.push(this.deck.pop());
        }
    }

    shuffle() {
        this.deck = this.discarded
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        this.discarded = [];
    }

    createDeck() {
        let deck = []
        for (let suit of suits) {
            for (let num of numbers) {
                deck.push(new Card(suit, num));
            }
        }
        return deck
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }
}

module.exports = {
    Game,
    Player
}
