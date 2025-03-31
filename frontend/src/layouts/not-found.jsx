import { useNavigate } from "react-router-dom";
import { Typography, Button} from "@material-tailwind/react";

export function NotFound() {

    const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <Typography variant="h1" className="text-6xl font-bold text-gray-800 mb-4">
        404
      </Typography>
      <Typography variant="h5" className="text-2xl font-semibold text-gray-600 mb-6">
        Oops! Page Not Found
      </Typography>
      <Typography variant="body1" className="text-gray-500 mb-4">
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className="mt-4"
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </div>
  );
}

NotFound.displayName = "/src/layout/Not-Found.jsx";

export default NotFound;
