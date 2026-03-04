const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const dbRooms = [];
const TEAM_RED = 'red';
const TEAM_BLUE = 'blue';

const onAnswer = (bool, room) => {
    bool ? room.game.count[room.game.currentQuestion.forTeam] += 1 : null
    room.game.currentQuestion = questions[Math.floor(Math.random() * questions.length)]

    io.to(room.roomId).emit('check_answer', {
        ok: bool,
        team: bool ? room.game.currentQuestion.forTeam : null,
        currentQuestion: {
            question: room.game.currentQuestion.question,
            answers: room.game.currentQuestion.answers,
            forTeam: room.game.currentQuestion.forTeam
        }
    })
}

const questions = [
    {
        id: 1,
        question: 'What is the capital of France?',
        options: ['Paris', 'London', 'Berlin', 'Rome'],
        success_answer: 0,
        forTeam: 'red'
    },
    {
        id: 2,
        question: 'Which planet is known as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
        forTeam: 'blue'
    },
    {
        id: 3,
        question: 'Who painted the Mona Lisa?',
        options: ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo'],
        success_answer: 0,
        forTeam: 'red'
    },
    {
        id: 4,
        question: 'What is the largest planet in our solar system?',
        options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'],
        success_answer: 0,
        forTeam: 'blue'
    },
    {
        id: 5,
        question: 'What is the smallest planet in our solar system?',
        options: ['Mercury', 'Venus', 'Earth', 'Mars'],
        success_answer: 0,
        forTeam: 'red'
    }
]

function pickBalancedTeam(participants) {
    let redCount = 0;
    let blueCount = 0;

    participants.forEach((participant) => {
        if (participant.team === TEAM_RED) {
            redCount += 1;
        } else if (participant.team === TEAM_BLUE) {
            blueCount += 1;
        }
    });

    if (redCount === blueCount) {
        // Alternate on ties so distribution remains stable.
        return participants.length % 2 === 0 ? TEAM_RED : TEAM_BLUE;
    }

    return redCount < blueCount ? TEAM_RED : TEAM_BLUE;
}

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
        questions: questions,
        activeQuestion: null,
        creatorId: null,
        messages: [],
        game: {
            count: {
                red: 0,
                blue: 0
            },
            status: 'waiting',
            currentQuestion: null
        }
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

app.post('/get_room', (req, res) => {
    const { roomId, role } = req.body;
    const room = dbRooms.find(room => room.roomId === roomId);
    if (room && role) {
        if (role === 'creator') {
            res.json({
                ok: true,
                data: {
                    roomId: room.roomId,
                    roomName: room.roomName,
                    quizTopic: room.quizTopic,
                    participantsCount: room.participants.length,
                    questionsCount: room.questionsCount,
                    participants: room.participants,
                    messages: room.messages
                }
            })
        } else if (role === 'participant') {
            res.json({
                ok: true, data: {
                    roomId: room.roomId,
                    roomName: room.roomName,
                    quizTopic: room.quizTopic,
                    participantsCount: room.participants.length,
                    messages: room.messages
                }
            });
        }
    } else {
        res.json({ ok: false });
    }
})

app.get('/init_start_game/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = dbRooms.find(room => room.roomId === Number(roomId));
    if (room) {
        res.json({
            ok: true, data: room.game
        });
    } else {
        res.json({ ok: false });
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join_room', ({ role, roomId }) => {
        const room = dbRooms.find(room => room.roomId === roomId);
        if (room) {
            const roomChannel = roomId;
            if (role === 'participant') {
                const team = pickBalancedTeam(room.participants);
                room.participants.push({
                    id: socket.id,
                    name: socket.id,
                    team,
                    role
                });
                room.participantsCount = room.participants.length;
            } else if (role === 'creator') {
                room.creatorId = socket.id;
            }
            socket.join(roomChannel);
            socket.emit('room_joined', {
                participants: room.participants,
                team: room.participants.find(participant => participant.id === socket.id)?.team
            });
            socket.to(roomChannel).emit('user_joined', room.participants);
        }
    });

    socket.on('message', (data) => {
        const room = dbRooms.find((entry) => entry.roomId === data.roomId);
        if (!room) {
            return;
        }

        room.messages.push(data);
        io.to(data.roomId).emit('message', data);
    });

    socket.on('disconnect', () => {
        dbRooms.forEach(room => {
            const previousCount = room.participants.length;
            room.participants = room.participants.filter(participant => participant.id !== socket.id);
            if (room.participants.length !== previousCount) {
                io.to(room.roomId).emit('user_left', room.participants);
            }
        });
    });

    socket.on('start_game', () => {
        const room = dbRooms.find((entry) => entry.creatorId === socket.id);
        if (!room) {
            return;
        }

        room.game.status = 'playing';
        room.game.currentQuestion = questions[0];

        io.to(room.roomId).emit('game_started', {
            status: 'playing',
            currentQuestion: {
                question: room.game.currentQuestion.question,
                answers: room.game.currentQuestion.answers,
                forTeam: room.game.currentQuestion.forTeam
            }
        });
    })

    socket.on('answer', ({ roomId, team, answer }) => {
        const room = dbRooms.find((entry) => entry.roomId === roomId);
        if (!room) {
            return;
        }

        (answer === room.game.currentQuestion.successAnswer
            && room.game.currentQuestion
            && team === room.game.currentQuestion.forTeam)
            ? onAnswer(true, room, team)

            : onAnswer(false, room, team)
    })
});

httpServer.listen(3000, () => {
    console.log('Server listening on port 3000');
});
