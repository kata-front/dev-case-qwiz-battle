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

export type Parcipant = {
    id: number
    name: string
    team: Team
    role: Role
}

export type RoomInfo_Participant = {
    roomName: string
    quizTopic: string
    parcipantsCount: number
    questionsCount: number
}

export type RoomInfo_Creator = RoomInfo_Participant & {
    parcipants: Parcipant[]
}