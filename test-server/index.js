const express = require('express');
const app = express();

const dbRooms = [];

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

app.post('/create_room', (req, res) => {
    const { roomName, quizTopic, maxParticipants, questionsCount } = req.body;
    const roomId = Date.now();
    dbRooms.push({
        roomId,
        roomName,
        quizTopic,
        maxParticipants,
        questionsCount,
        participants: [],
        questions: [],
        activeQuestion: null
    });
    res.json({ ok: true, roomId, role: 'creator' });
})

app.post('/check_pincode', (req, res) => {
    const { pincode } = req.body;
    const pincodeNumber = Number(pincode);
    const room = dbRooms.find(room => room.roomId === pincodeNumber);
    if (room) {
        res.json({ ok: true, roomId: room.roomId, role: 'participant' });
    } else {
        res.json({ ok: false });
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
