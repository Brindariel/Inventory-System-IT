import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { UnitDetails } from "./pages/UnitDetails";
import { AddUnit } from "./pages/AddUnit";
import { Users } from "./pages/Users";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/units/:id",
    Component: UnitDetails,
  },
  {
    path: "/add-unit",
    Component: AddUnit,
  },
  {
    path: "/users",
    Component: Users,
  },
]);
