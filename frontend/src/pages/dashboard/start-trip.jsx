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
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    visibility: "private",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (val) => {
    setFormData((prev) => ({ ...prev, visibility: val }));
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await createTrip(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to create trip.");
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
    </Card>
  );
}

export default StartTrip;
