import {
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

export const featuresData = [
  {
    color: "gray",
    title: "User Authentication",
    icon: LockClosedIcon,
    description:
      "Secure login system to protect user data.",
  },
  {
    color: "gray",
    title: "Trip Management",
    icon: BookOpenIcon,
    description:
      "Add, view, and delete trips with details like destination, dates, and notes.",
  },
  {
    color: "gray",
    title: "Interactive Dashboard",
    icon: ComputerDesktopIcon,
    description:
      "Visual representation of travel history and upcoming plans.",
  },
];

export default featuresData;
