import { useState, type FC } from "react";
import type { StartModalsType } from "../../shared/types";
import { CreateModal } from "./modules/createModal";
import { PinModal } from "./modules/pinModal";

export const StartWindow: FC = () => {
    const [modalActive, setModalActive] = useState<StartModalsType>(null);

    return <section>
        <button onClick={() => setModalActive('create') }>Create</button>
        <button onClick={() => setModalActive('pin') }>Login</button>

        {modalActive === 'create' && <CreateModal modalClose={() => setModalActive(null)} />}
        {modalActive === 'pin' && <PinModal modalClose={() => setModalActive(null)} />}
    </section>
};