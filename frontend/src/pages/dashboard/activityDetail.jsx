import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Textarea,
  IconButton
} from "@material-tailwind/react";
import { getTripDetails, getDetailsOn, addNewTripActivity } from "@/util/api";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { CheckIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import { ClipLoader } from "react-spinners";

export function TripActivityDetail() {
  const { date, id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const [location, setLocation] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [newActivity, setNewActivity] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);

  const fetchTripAndDetails = async () => {
    try {
      const tripRes = await getTripDetails(id);
      setTrip(tripRes.data.trip);
      const detailsRes = await getDetailsOn(id, date);
      setDetail(detailsRes.data.detail);
      setLocation(detailsRes.data.detail.location);
    } catch (err) {
      console.error(err);
      setError("Failed to load trip details.");
    }
  };

  useEffect(() => {
    fetchTripAndDetails();
  }, [date, id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) 
      return;
    try {
      await addNewTripActivity(id, {
        note: newNote,
        date,
      });
      setNewNote("");
      setAddingNote(false);
      fetchTripAndDetails();
    } catch (err) {
      setError("Failed to add note.");
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) 
      return;
    try {
      await addNewTripActivity(id, {
        activities: newActivity,
        date,
      });
      setNewActivity("");
      setAddingActivity(false);
      fetchTripAndDetails();
    } catch (err) {
      setError("Failed to add activity.");
    }
  };

  const handleLocationSave = async () => {
    if (!location.trim())
      return;
    try {
      await addNewTripActivity(id,{
        date, 
        location
      });
      setEditingLocation(false);
      fetchTripAndDetails();
    } catch (e) {
      setError("Failed to update location.");
    }
  };

  if (!trip || !detail) 
    {
    return (
      <div className="mx-[calc(100%/2)] my-[calc(100%/4)]">
        <ClipLoader/>
      </div>
    );
  }

  return (
    <Card className="w-full p-6 mx-auto">
      {trip && (
        <>
          <Link to={`/dashboard/trip/${id}`}><Typography variant="h4" color="blue-gray">{trip.name}</Typography></Link>
          <Typography color="gray" className="mb-2 mt-2">{trip.location}</Typography>
          <hr className="mb-6"/>
        </>
      )}
      <div className="flex flex-col mb-6">
        <Typography variant="h6" color="blue-gray" className="mr-4">Location</Typography>
        {editingLocation ? (
              <div className="flex flex-row">
                <Input
                  label="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <IconButton variant="text" onClick={handleLocationSave}>
                  <CheckIcon className="w-5 h-5 text-green-600" />
                </IconButton>
                <IconButton variant="text" onClick={() => {
                  setEditingLocation(false);
                  setLocation(detail.location || trip.location);
                }}>
                  <XMarkIcon className="w-5 h-5 text-red-600" />
                </IconButton>
              </div>
            ) : (
              <div className="flex flex-row">
                <Typography className="mt-2">
                  {detail?.location || trip.location}
                </Typography>
                {trip.isAdmin && <IconButton variant="text" onClick={() => setEditingLocation(true)}>
                  <PencilIcon className="w-3 h-3   text-gray-600" />
                </IconButton>}
              </div>
            )}
      </div>
      {detail && (
        <div className="flex flex-col lg:flex-row lg:justify-between">
          <div className="w-full m-6">
            <Typography variant="h6" color="blue-gray">Notes</Typography>
            <div className="space-y-3 mt-2">
              {detail.note && detail.note.map((n, idx) => (
                <Card key={idx} className="p-3 bg-gray-50">
                  <Typography>{n}</Typography>
                </Card>
              ))}

              {trip.isAdmin && (addingNote ? (
                <Card className="p-3 bg-white flex flex-col gap-2">
                  <Textarea
                    label="New note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote}>Save</Button>
                    <Button variant="text" onClick={() => setAddingNote(false)}>Cancel</Button>
                  </div>
                </Card>
              ) : (
                <Button variant="outlined" onClick={() => setAddingNote(true)}>+ New note</Button>
              ))}
            </div>
          </div>

          <div className="w-full m-6">
            <Typography variant="h6" color="blue-gray" className="mt-6 lg:mt-0">Activities</Typography>
            <div className="space-y-3 mt-2">
              {detail.activities.length != 0 && detail.activities.map((a, idx) => (
                <Card key={idx} className="p-3 bg-gray-50">
                  <Typography>{a}</Typography>
                </Card>
              ))}

              {trip.isAdmin && (addingActivity ? (
                <Card className="p-3 bg-white flex flex-col gap-2">
                  <Textarea
                    label="New activity"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddActivity}>Save</Button>
                    <Button variant="text" onClick={() => setAddingActivity(false)}>Cancel</Button>
                  </div>
                </Card>
              ) : (
                <Button variant="outlined" onClick={() => setAddingActivity(true)}>+ New activity</Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <Typography color="red" className="text-sm mt-4">{error}</Typography>
      )}
    </Card>
  );
}

export default TripActivityDetail;
