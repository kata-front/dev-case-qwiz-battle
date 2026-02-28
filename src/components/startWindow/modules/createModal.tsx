import type { FC, FormEvent } from "react";
import type { CreateInfo } from "../../../shared/types";
import { startWindowApi } from "../startWApi";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../shared/redux_store";
import { setRole } from "../../../shared/roleSlice";

export const CreateModal: FC<{ modalClose: () => void }> = ({ modalClose }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [create_room] = startWindowApi.useCreate_roomMutation();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const creatorInfo: CreateInfo = {
            roomName: String(formData.get("roomName") ?? ""),
            quizTopic: String(formData.get("quizTopic") ?? ""),
            maxParticipants: Number(formData.get("maxParticipants") ?? 0),
            questionsCount: Number(formData.get("questionsCount") ?? 0),
        };

        const responce = await create_room(creatorInfo).unwrap();

        if (responce.ok) {
            dispatch(setRole(responce.role));
            navigate('/room/' + responce.roomId)
        }
    };

    return <section>
        <p onClick={modalClose}>back</p>

        <form onSubmit={handleSubmit}>
            <input name="roomName" type="text" placeholder="Введите название комнаты" />
            <input name="quizTopic" type="text" placeholder="Тема квиза" />
            <input name="maxParticipants" type="number" placeholder="Максимальное число участников" />
            <input name="questionsCount" type="number" placeholder="Количество вопросов" />

            <button type="submit">Создать</button>
        </form>
    </section>;
};
