const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware für JSON-Parsing

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

const users = [];
const authorizedTokens = [];
const highScores = [];

app.post("/signup", (req, res) => {
    const { userHandle: username, password } = req.body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string" || username.length < 6 || password.length < 6) {
        return res.status(400).send("Invalid request body");
    }

    users.push({ username, password });
    console.log(users);
    res.status(201).send("User registered successfully");
});

app.post("/login", (req, res) => {
    const { userHandle: username, password } = req.body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string" || username.length < 6 || password.length < 6 || Object.keys(req.body).length !== 2) {
        return res.status(400).send("Bad Request");
    }

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).send("Unauthorized, incorrect username or password");
    }

    const token = `${username}-${Date.now()}`;
    authorizedTokens.push(token);
    res.status(200).json({ jsonWebToken: token });
});

app.post("/high-scores", (req, res) => {
    const authorizationField = req.headers.authorization;
    if (!authorizationField) {
        return res.status(401).send("Unauthorized, JWT token is missing or invalid");
    }

    const token = authorizationField.split(" ")[1];
    if (!authorizedTokens.includes(token)) {
        return res.status(401).send("Unauthorized, JWT token is missing or invalid");
    }

    const { level, userHandle: username, score, timestamp } = req.body;
    if (!level || !username || !score || !timestamp) {
        return res.status(400).send("Invalid request body");
    }

    highScores.push({ level, username, score, timestamp });
    res.status(201).send("High score posted successfully");
});

app.get("/high-scores", (req, res) => {
    const { level, page = 1 } = req.query;
    
    const highScoresFiltered = highScores.filter(highScore => highScore.level === level);
    
    const highScoresPage = highScoresFiltered
        .sort((a, b) => b.score - a.score)
        .slice((page - 1) * 20, page * 20);
    
    res.status(200).json(highScoresPage);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
    start: function () {
        serverInstance = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    },
    close: function () {
        if (serverInstance) {
            serverInstance.close();
        }
    },
};
