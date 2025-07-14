// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import { Home } from "./pages/Home";
import { Models } from "./pages/Models";
import { Documents } from "./pages/Documents";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "models", element: <Models /> },
      { path: "documents", element: <Documents /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
