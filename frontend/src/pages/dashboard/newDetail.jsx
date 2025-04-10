import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Option,
  Typography,
  Textarea
} from "@material-tailwind/react";
import { addNewTripActivity, createTrip } from "@/util/api";
import { useNavigate, useParams } from "react-router-dom";

export function NewDetail() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    note: "",
    date: "",
    location: "",
    activities: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addNewTripActivity(id, formData);
      navigate("/dashboard/trip/" + id);
    } catch (err) {
      console.error(err);
      alert("Failed to create trip.");
    }
  };

  return (
    <Card className="w-full p-6 max-w-lg mx-auto space-y-4">
      <Typography variant="h5" color="blue-gray">Add new detail</Typography>

      <Input
        label="Note"
        name="note"
        value={formData.note}
        onChange={handleChange}
        required
      />

      <Input
        label="Date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        type="date"
        required
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <Textarea
        label="Activities"
        name="activities"
        value={formData.activities}
        onChange={handleChange}
      />

      <Button onClick={handleSubmit}>Add detail</Button>
    </Card>
  );
}

export default NewDetail;
