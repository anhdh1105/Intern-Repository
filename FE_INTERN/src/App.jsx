import { createBrowserRouter, RouterProvider } from "react-router-dom";
import StudentManagement from "./pages/StudentManagement/StudentManagement";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";

const App = () => {
    const router = createBrowserRouter([
        {
            path: "",
            element: <StudentManagement />,
        },
        {
            path: "/add",
            element: <AddStudent />,
        },
        {
            path: "/edit/:id",
            element: <EditStudent />,
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;
