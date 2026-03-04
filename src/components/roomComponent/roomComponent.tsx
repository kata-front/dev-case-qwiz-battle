import { skipToken } from "@reduxjs/toolkit/query";
import { useState, type FC } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../shared/redux_store";
import { roleSlice } from "../../shared/roleSlice";
import { roomApi } from "./roomApi";
import { socketManager } from "../../shared/socketManager";
import { playApi } from "./playApi";

export const RoomComponent: FC = () => {
    const [inpMessage, setInpMessage] = useState<string>('')

    const { roomId } = useParams();
    const roomValidId = Number(roomId);

    const role = useAppSelector(roleSlice.selectors.getRole);

    const roomQueryArg =
        role === "" || Number.isNaN(roomValidId)
            ? skipToken
            : { role, roomId: roomValidId };

    const { data, isLoading } = roomApi.useGetRoomInfoQuery(roomQueryArg);
    const { data: playData, isLoading: playIsLoading } = playApi.useInitStartGameQuery(roomValidId)

    if (role === "") {
        return <div>Вы не зашли в комнату</div>;
    }

    if (isLoading || playIsLoading) {
        return <div>Loading...</div>;
    }

    if (!data?.ok || !playData?.ok) {
        return <div>Room not found</div>;
    }

    return <div>
        <div>Status {playData.data.status}</div>
        {role === 'creator' && <div onClick={() => {
            socketManager.getSocket()?.emit('start_game', roomValidId);
        }}>Start play</div>}
        {playData.data.status === 'playing'
            && <div>
                Red: {playData.data.count.red} | Blue: {playData.data.count.blue}
            </div>}
        <div>{data.data.roomId}</div>
        <div>{data.data.roomName}</div>
        <div>{data.data.quizTopic}</div>
        <div>{data.data.participantsCount}</div>

        {playData.data.status === 'playing'
            && playData.data.currentQuestion
            && 'team' in data.data
            && (
                data.data.team === playData.data.currentQuestion.forTeam
                || role === 'creator'
            )
            && <div>
                <div>{playData.data.currentQuestion.question}</div>
                <div>{playData.data.currentQuestion.answers.map(
                    (answer) => <div onClick={() => {
                        socketManager.getSocket()?.emit('answer', {
                            roomId: roomValidId,
                            team: 'team' in data.data ? data.data.team : 'creator',
                            answer
                        })
                    }}>{answer}</div>
                )}</div>
            </div>}

        <div className="chat">
            <div className="place">
                {
                    data.data.messages.map((message) => {
                        return <div className="message" key={message.roomId + message.team + message.message}>
                            <div className="team">{message.team}</div>
                            <div className="text">{message.message}</div>
                        </div>
                    })
                }
            </div>
            <input
                type="text"
                placeholder="Введите сообщение"
                value={inpMessage}
                onChange={(e) => setInpMessage(e.target.value)}
            />
            <button onClick={() => {
                socketManager.getSocket()?.emit('message', {
                    roomId: roomValidId,
                    team: 'team' in data.data ? data.data.team : 'creator',
                    message: inpMessage
                });
            }}>Отправить</button>
        </div>
    </div>;
};
