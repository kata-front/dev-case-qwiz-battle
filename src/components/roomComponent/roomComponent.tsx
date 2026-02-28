import type { FC } from "react";
import { useParams } from "react-router-dom";
import { roomApi } from "./roomApi";
import { useAppSelector } from "../../shared/redux_store";
import { roleSlice } from "../../shared/roleSlice";

export const RoomComponent: FC = () => {
    const { roomId } = useParams();
    const roomValidId = Number(roomId);

    const role = useAppSelector(roleSlice.selectors.getRole)

    if (role === "") {
        return <div>Ошибка, вы не вошли в комнату</div>
    }

    const [infoRoom] = role === "creator" ? roomApi.endpoints.getRoomForCreator.initiate({ role, roomId: roomValidId }) : roomApi.endpoints.getRoomForParticipant.initiate({ role, roomId: roomValidId })   ;    

    return <div>

    </div>
};