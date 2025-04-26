import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Textarea,
  IconButton
} from "@material-tailwind/react";
import { getTripDetails, getDetailsOn, addNewTripActivity, updateTripActivity } from "@/util/api";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
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
  const [editingNote, setEditingNote] = useState(-1);
  const [editNoteValue, setEditNoteValue] = useState("");

  const [newActivity, setNewActivity] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState(-1);
  const [editActivityValue, setEditActivityValue] = useState("");

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

  const handleEditDetails = async () => {
    if (editingNote > -1 && editNoteValue.trim()) {
      try {
        await updateTripActivity(id, {
          from: { note: detail.note[editingNote] },
          to: { note: editNoteValue},
          date,
        });
        setEditingNote(-1);
        fetchTripAndDetails();
      } catch (e) {
        setError("Failed to update note");
      }
    } else if (editingActivity > -1 && editActivityValue.trim()) {
      try {
        await updateTripActivity(id, {
          from: { activities: detail.activities[editingActivity] },
          to: { activities: editActivityValue },
          date,
        });
        setEditingActivity(-1);
        fetchTripAndDetails();
      } catch (e) {
        setError("Failed to update activity");
      }
    }
  }

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
          <div className="w-full lg:m-2">
            <Typography variant="h6" color="blue-gray">Notes</Typography>
            <div className="space-y-3 mt-2">
              {detail.note && detail.note.map((n, idx) => (
                editingNote == idx ? 
                <Card key={idx} className="p-3 bg-gray-200">
                  <Textarea
                    label="Edit note"
                    value={editNoteValue}
                    onChange={(e) => setEditNoteValue(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleEditDetails}>Save</Button>
                    <Button variant="text" onClick={() => setEditingNote(-1)}>Cancel</Button>
                  </div>
                </Card>
                 :
                <Card key={idx} className="p-3 bg-gray-200 flex flex-row justify-between">
                  <Typography>{n}</Typography>
                  {
                  trip.isAdmin && (
                    <div className="flex flex-row mt-auto">
                      <IconButton variant="text" onClick={() => {setEditNoteValue(n); setEditingNote(idx);}}>
                        <PencilIcon className="w-3 h-3   text-gray-600" />
                      </IconButton>
                      {/* <IconButton variant="text" onClick={() => alert("implement me")}>
                        <TrashIcon className="w-3 h-3   text-gray-600" />
                      </IconButton> */}
                    </div>
                  )}
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

          <div className="w-full lg:m-2">
            <Typography variant="h6" color="blue-gray" className="mt-6 lg:mt-0">Activities</Typography>
            <div className="space-y-3 mt-2">
              {detail.activities.length != 0 && detail.activities.map((a, idx) => (
                editingActivity == idx ? 
                <Card key={idx} className="p-3 bg-gray-200">
                  <Textarea
                    label="Edit activity"
                    value={editActivityValue}
                    onChange={(e) => setEditActivityValue(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={handleEditDetails}>Save</Button>
                    <Button variant="text" onClick={() => setEditingActivity(-1)}>Cancel</Button>
                  </div>
                </Card>
                 :
                <Card key={idx} className="p-2 bg-gray-200 flex flex-row justify-between">
                  <Typography>{a}</Typography>
                  {
                  trip.isAdmin && (
                    <div className="flex flex-row mt-auto">
                      <IconButton variant="text" onClick={() => {setEditActivityValue(a); setEditingActivity(idx);}}>
                        <PencilIcon className="w-3 h-3   text-gray-600" />
                      </IconButton>
                      {/* <IconButton variant="text" onClick={() => alert("implement me")}>
                        <TrashIcon className="w-3 h-3   text-gray-600" />
                      </IconButton> */}
                    </div>
                  )}
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
