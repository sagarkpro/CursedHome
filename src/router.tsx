import { createBrowserRouter } from "react-router-dom";
import Home from "./Home.tsx";
import Callback from "./Callback.tsx";

export const router = createBrowserRouter([
	{ path: "/", element: <Home /> },
	{ path: "/callback", element: <Callback /> },
]);
