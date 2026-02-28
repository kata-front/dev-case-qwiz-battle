import { createBrowserRouter, Outlet, redirect } from "react-router-dom";
import { StartWindow } from "./components/startWindow/startWindow";
import { RoomComponent } from "./components/roomComponent/roomComponent";
export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div>
                <div>Home</div>
                <Outlet />
            </div>
        ),
        children: [
            {
                index: true,
                loader: () => redirect("/start"),
            },
            {
                path: "start",
                element: <StartWindow />
            },
            {
                path: "room/:roomId",
                element: <RoomComponent />
            }
        ]
    }
])
