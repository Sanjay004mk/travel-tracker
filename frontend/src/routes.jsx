import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  StarIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon
} from "@heroicons/react/24/solid";
import { Home, Favorites, Compare, Profile, Trip, Expenses, Settings } from "@/pages/dashboard";
import { SignIn, SignUp, SignOut } from "@/pages/auth";
import { Navigate } from "react-router-dom";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "dashboard",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon}  />,
        name: "My Trips",
        path: "/home",
        element: <Home />,
        navElement: true,
      },
      {
        icon: <StarIcon {...icon} />,
        name: "Favorites",
        path: "/favorites",
        element: <Favorites />,
        navElement: true,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Compare Trips",
        path: "/compare",
        element: <Compare />,
        navElement: true,
      },
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Expenses",
        path: "/expenses",
        element: <Expenses />,
        navElement: true,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Settings",
        path: "/settings",
        element: <Settings />,
        navElement: true,
      },
      {
        icon: <Cog6ToothIcon { ...icon} />,
        name: "Profile",
        path: "/profile",
        element: <Profile />,
        navElement: false,
      },      
      {
        icon: <BuildingOffice2Icon {...icon} />,
        name: "Trips",
        path: "/trip/:id",
        element: <Trip />,
        navElement: false,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <ServerStackIcon { ...icon} />,
        name: "sign out",
        path: "/sign-out",
        element: <SignOut />
      },
    ],
  },
  {
    title: "landing pages",
    layout: "home",
    pages: [
        {
          name: "home",
          path: "home",
        },
        {
          name: "features",
          path: "features",
        },
        {
          name: "about",
          path: "about",
        },
    ],
  },
];

export default routes;
