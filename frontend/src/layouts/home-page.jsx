import React from "react";
import { Button, Card, CardContent, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center">
      <Typography variant="h3" className="font-bold text-gray-800 mb-4">
        Welcome to Travel Tracker
      </Typography>
      <Typography variant="body1" className="text-gray-600 mb-6 max-w-xl">
        Plan, track, and manage your trips effortlessly. Keep an eye on your expenses and make every journey stress-free.
      </Typography>
      <div className="flex gap-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/trips")}
        >
          View Trips
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/expenses")}
        >
          Manage Expenses
        </Button>
      </div>
    </div>
  );
}


HomePage.displayName = "/src/layout/Home-Page.jsx";

export default HomePage;
