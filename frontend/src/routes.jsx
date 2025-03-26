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
import { Home, Profile, Tables, Notifications, Settings } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "dashboard",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "My Trips",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <StarIcon {...icon} />,
        name: "Favorites",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Compare Trips",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <BuildingOffice2Icon {...icon} />,
        name: "Destinations",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Expenses",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Settings",
        path: "/settings",
        element: <Settings />,
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
    ],
  },
];

export default routes;
