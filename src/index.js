const {createServer} = require("http");
const {Server} = require("socket.io");
const {Game} = require("./objects/game");
const {Player} = require("./objects/player");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        credentials: true
    }
});


let players = [];
let game;

const addPlayer = (player) => {
    players.push(player);
    if (players.length > 1) {
        game = new Game(players);
    }
}

const concludeGame = () => {
    const winningPlayer = game.checkWinner();
    if (game.players[0].conId === winningPlayer) {
        io.to(game.players[0].conId).emit("results", {
            result: "win",
            score: game.players[0].score,
            other: game.players[1].score,
            otherCards: game.players[1].hand
        })
        io.to(game.players[1].conId).emit("results", {
            result: "lose",
            score: game.players[1].score,
            other: game.players[0].score,
            otherCards: game.players[0].hand
        })
    } else if (game.players[1].conId === winningPlayer) {
        io.to(game.players[1].conId).emit("results", {
            result: "win",
            score: game.players[1].score,
            other: game.players[0].score,
            otherCards: game.players[0].hand
        })
        io.to(game.players[0].conId).emit("results", {
            result: "lose",
            score: game.players[0].score,
            other: game.players[1].score,
            otherCards: game.players[1].hand
        })
    } else if (winningPlayer === null) {
        io.to(game.players[0].conId).emit("results", {
            result: "draw",
            score: game.players[0].score,
            other: game.players[1].score,
            otherCards: game.players[1].hand
        })
        io.to(game.players[1].conId).emit("results", {
            result: "draw",
            score: game.players[1].score,
            other: game.players[0].score,
            otherCards: game.players[0].hand
        })
    }
}

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    addPlayer(new Player(username, socket.id));
    next();
});

io.on("connection", (socket) => {
    socket.emit("conId", socket.id);

    socket.on("draw", () => {
        game.draw(socket.id)
        socket.emit("draw", game.getPlayerById(socket.id).hand);
        socket.broadcast.emit("opponentDraw");
    });
    socket.on("stay", () => {
        game.getPlayerById(socket.id).stays = true;
        if (!game.players.some(player => player.stays === false)) {
            concludeGame(socket);
        }
    });
    socket.on("nextHand", () => {
        game.getPlayerById(socket.id).wantsNextGame = true;
        if (!game.players.some(player => player.wantsNextGame === false)) {
            game.nextGame();
            io.emit("nextHand");
        }
    });
    socket.on("disconnect", () => {
        players = players.filter(player => player.conId !== socket.id);
    });
});

io.on("stay", (socket) => {
    game.getPlayerById(socket.id).stays = true;
    if (!game.players.some(player => player.stays === false)) {
        concludeGame();
    }
});

httpServer.listen(3001);




