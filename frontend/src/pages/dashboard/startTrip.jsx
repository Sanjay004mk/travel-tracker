import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import { createTrip } from "@/util/api";
import { useNavigate } from "react-router-dom";

export function StartTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    visibility: "private",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (val) => {
    setFormData((prev) => ({ ...prev, visibility: val }));
  };

  const validateForm = () => {
    if (!formData.location.trim()) {
      return "Location is required.";
    }
    if (!formData.startDate) {
      return "Start date is required.";
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      return "End date cannot be before start date.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await createTrip(formData);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status == 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to create trip. Please try again.");
      }
    }
  };

  return (
    <Card className="w-full p-6 max-w-lg mx-auto space-y-4">
      <Typography variant="h5" color="blue-gray">Start a New Trip</Typography>

      <Input
        label="Trip Name (Optional)"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
      />

      <Input
        label="End Date"
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
      />

      <Select
        label="Visibility"
        value={formData.visibility}
        onChange={handleSelectChange}
      >
        <Option value="private">Private</Option>
        <Option value="friends">Friends</Option>
      </Select>

      <Button onClick={handleSubmit}>Create Trip</Button>

      {error && (
        <Typography color="red" className="text-sm mt-2">
          {error}
        </Typography>
      )}

    </Card>
  );
}

export default StartTrip;
