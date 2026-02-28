import type { FC, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { setRole } from "../../../shared/roleSlice";
import { useAppDispatch } from "../../../shared/redux_store";
import { startWindowApi } from "../startWApi";

export const PinModal: FC<{ modalClose: () => void }> = ({ modalClose }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [check_pincode] = startWindowApi.useCheck_pincodeMutation();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const pincode = Number(formData.get("pincode") ?? 0);

        const responce = await check_pincode(pincode).unwrap();

        if (responce.ok) {
            dispatch(setRole(responce.role));
            navigate("/room/" + responce.roomId);
        }
    };

    return <section>
        <p onClick={modalClose}>back</p>

        <form onSubmit={handleSubmit}>
            <input name="pincode" type="number" placeholder="Введите пинкод" />

            <button type="submit">Войти</button>
        </form>
    </section>;
};
