const {createServer} = require("http");
const {Server} = require("socket.io");
const {Card} = require("./objects/card");
const {Game, Player} = require("./objects/game");

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let players = [];
let game;

const addPlayer = (player) => {
    players.push(player);
    if(players.length > 1) {
        console.log("started game");
        game = new Game(players);
    }
}

const concludeGame = (socket) => {
    const winningPlayer = game.checkWinner();
    if(game.players[0].conId === winningPlayer) {
        io.to(game.players[0].conId).emit("resultsw", {result: "win", score: game.players[0].score, other: game.players[1].score})
        io.to(game.players[1].conId).emit("resultsl", {result: "lose", score: game.players[1].score, other: game.players[0].score})
    } else if(game.players[1].conId === winningPlayer) {
        io.to(game.players[1].conId).emit("resultsw", {result: "win", score: game.players[1].score, other: game.players[0].score})
        io.to(game.players[0].conId).emit("resultsl", {result: "lose", score: game.players[0].score, other: game.players[1].score})
    } else if(winningPlayer === null){
        io.to(game.players[0].conId).emit("resultsd", {result: "draw", score: game.players[0].score, other: game.players[1].score})
        io.to(game.players[1].conId).emit("resultsd", {result: "draw", score: game.players[1].score, other: game.players[0].score})
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
    socket.on("draw", () => {
        game.draw(socket.id)
        socket.emit("draw", game.getPlayerById(socket.id).hand);
    });
    socket.on("stay", () => {
        game.getPlayerById(socket.id).stays = true;
        if(!game.players.some(player => player.stays === false)) {
            concludeGame(socket);
        }
    });
});

io.on("stay", (socket) => {
    game.getPlayerById(socket.id).stays = true;
    if(!game.players.some(player => player.stays === false)) {
        concludeGame();
    }
});

httpServer.listen(3001);




