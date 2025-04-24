import { useEffect, useState } from "react";
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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getTripDetails } from "@/util/api";

export function NewDetail() {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    note: "",
    date: "",
    location: "",
    activities: "",
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: location.state.selectedDate,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchTripDetails = async () => {
    const { data } = await getTripDetails(id);
    return data.trip;
  };

  const validateForm = async () => {
    let trip;
    try {
      trip = await fetchTripDetails();
    } catch (e) {
      setError("Failed to find trip.");
      return false;
    }
    if (!formData.note.trim()) {
      setError("Note is required.");
      return false;
    }
    if (!formData.date) {
      setError("Date is required.");
      return false;
    }
    if (formData.date < trip.startDate) {
      setError("Date cannot be before start date.");
      return false;
    } 
    if (trip.endDate && formData.date > trip.endDate) {
      setError("Date cannot be after end date.");
      return false;
    }
    if (!formData.location.trim()) {
      formData.location = trip.location;
      setError("Location not provided. Setting to " + formData.location);
    }

    return true;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!await validateForm()) {
      return;
    }
    try {
      await addNewTripActivity(id, formData);
      navigate("/dashboard/trip/" + id);
    } catch (err) {
      if (err.response?.status == 500) {
        setError("Server error. Try again later.")
      } else {
        setError("Failed to add new detail. Try again.");
      }
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
      {
        error && (
          <Typography color="red" className="text-sm mt-2">
          {error}
          </Typography>
        )
      }
    </Card>
  );
}

export default NewDetail;
