export type StartModalsType = 'create' | 'pin' | null
export type CreateInfo = {
    roomName: string
    quizTopic: string
    maxParticipants: number
    questionsCount: number
}


export type Role = 'creator' | 'participant'

export type ResponceStartModal = {
    ok: true
    role: Role
    roomId: number
} | {
    ok: false
} 

export type getRoomType = {
    role: Role
    roomId: number
}

export type Team = 'red' | 'blue'

export type Participant = {
    id: number
    name: string
    team: Team
    role: Role
}

export type RoomInfo_Participant = {
    roomId: number
    roomName: string
    quizTopic: string
    participantsCount: number
    messages: Chat_message[]
    team: Team | undefined
}

export type RoomInfo_Creator = Omit<RoomInfo_Participant, 'team'> & {
    participants: Participant[]
}

export type RoomInfo = {
    ok: true
    data: RoomInfo_Participant | RoomInfo_Creator
} | {
    ok: false
}

export type Chat_message = {
    team: Team | 'creator'
    roomId: number
    message: string
}

export type StartGameResponce = {
    ok: true
    data: {
        count: { red: number, blue: number }
        status: 'waiting' | 'playing'
        currentQuestion: Question | null
    }
} | {
    ok: false
}

export type Question = {
    question: string
    answers: string[]
    forTeam: Team
}