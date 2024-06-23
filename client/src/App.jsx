import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  HomeLayout,
  Landing,
  Login,
  Register,
  DashboardLayout,
  Error,
  AddParkingSpot,
  Stats,
  AllParkingSpots,
  Profile,
  Admin,
  EditParkingSpot,
  ViewPage,
} from "./pages";
import { action as registerAction } from "./pages/Register";
import { action as loginAction } from "./pages/Login";
import { action as deleteAction } from "./pages/DeleteParkingSpot";
import { action as profileAction } from "./pages/Profile";
import { loader as dashboardLoader } from "./pages/DashboardLayout";
import { loader as adminLoader } from "./pages/Admin";
import { loader as editParkingSpotLoader } from "./pages/EditParkingSpot";
import { loader as allParkingSpotsLoader } from "./pages/AllParkingSpots";
import { loader as statsLoader } from "./pages/Stats";
import { loader as ViewLoader } from "./pages/ViewParkingSpot";
export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  document.body.classList.toggle("dark-theme", isDarkTheme);
  return isDarkTheme;
};
const isDarkThemeEnabled = checkDefaultTheme();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: "register",
        element: <Register />,
        action: registerAction,
      },
      { path: "login", element: <Login />, action: loginAction },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          {
            element: <AddParkingSpot />,
            path: "add-parkingspot",
          },
          {
            path: "stats",
            element: <Stats />,
            loader: statsLoader,
          },
          {
            index: true,

            element: <AllParkingSpots />,
            loader: allParkingSpotsLoader,
          },
          {
            path: "profile",
            element: <Profile />,
            action: profileAction,
          },
          {
            path: "admin",
            element: <Admin />,
            loader: adminLoader,
          },
          {
            path: "edit-parking/:id",
            element: <EditParkingSpot />,
            loader: editParkingSpotLoader,
          },
          {
            path: "delete-parking/:id",
            action: deleteAction,
          },
          {
            path: "parkingspots/:id",
            element: <ViewPage />,
            loader: ViewLoader,
          },
        ],
      },
      { path: "landing", element: <Landing /> },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
