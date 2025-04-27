import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Checkbox,
  Textarea,
} from "@material-tailwind/react";
import { PencilIcon, ArrowRightCircleIcon, PlusCircleIcon, DocumentDuplicateIcon, UserIcon, TrashIcon } from "@heroicons/react/24/solid";

import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { getTripDetails, updateTripDetails, addNewTripActivity, removeFromTrip, inviteToTrip, addToTrip } from "@/util/api";
import { ClipLoader } from "react-spinners";
import { TripCard } from "@/widgets/cards";

import toast from "react-hot-toast";
import { useMaterialTailwindController } from "@/context";

export function Trip() {
  const { id } = useParams();
  const { user } = useMaterialTailwindController();
  const [tripDetails, setTripDetails] = useState({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [modalFormData, setModalFormData] = useState({});
  const [openTripModal, setOpenTripModal] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [tripModalError, setTripModalError] = useState("");
  const [allDates, setAllDates] = useState([]);
  const [openActivityModal, setOpenActivityModal] = useState(false);
  const [activityModalError, setActivityModalError] = useState("");
  const [activityFormData, setActivityFormData] = useState({
      note: "",
      date: "",
      location: "",
      activities: "",
  });

  const navigate = useNavigate();

  const labels = useMemo(() => ({
    name: "Trip Name",
    location: "Location",
    startDate: "Start Date",
    endDate: "End Date",
  }), []);

  const excludeLabels = useMemo(() => (["tripCode", "details", "favorited", "isAdmin", "completed"]), []);

  const getMissingDates = (start, existingDetails) => {
    const missing = [];
    const existingDates = new Set(existingDetails.map(detail => new Date(detail.date).toDateString()));
  
    const startDate = new Date(start);
  
    // Find the latest date in existingDetails
    const lastExistingDate = existingDetails.length
      ? new Date(Math.max(...existingDetails.map(detail => new Date(detail.date))))
      : startDate;
  
    for (let d = new Date(startDate); d <= lastExistingDate; d.setDate(d.getDate() + 1)) {
      if (!existingDates.has(d.toDateString())) {
        missing.push(new Date(d));
      }
    }
  
    return missing;
  };
  

  const updateAllDates = (details, start, end) => {
      const detailDates = details.map(detail => ({
        type: "detail",
        date: new Date(detail.date),
        data: detail,
      }));

    const missingDates = getMissingDates(
      start,
      details
    ).map(date => ({
      type: "missing",
      date: new Date(date),
    }));
    setAllDates(
      [...detailDates, ...missingDates].sort((a, b) => a.date - b.date)
    );
    
  };

  const fetchTripDetails = async () => {
    try {
      const { data } = await getTripDetails(id);
      setTripDetails(data.trip);
      setFetchError(false);
      updateAllDates(data.trip.details, data.trip.startDate, data.trip.endDate);
    } catch (err) {
      setFetchError(true);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) 
      return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openEditModal = () => {
    const formData = { ...tripDetails };
    formData.startDate = formatDateForInput(formData.startDate);
    formData.endDate = formData.endDate ? formatDateForInput(formData.endDate) : "";
    setModalFormData(formData);
    setOpenTripModal(true);
    setTripModalError("");
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModalFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(type === "checkbox" && !checked ? { endDate: "" } : {}),
    }));
  };

  const validateForm = () => {
    if (!modalFormData.location.trim()) {
      setTripModalError("Location is required.");
      return false;
    }
    if (!modalFormData.startDate) {
      setTripModalError("Start date is required.");
      return false;
    }
    if (modalFormData.endDate && modalFormData.endDate < modalFormData.startDate) {
      setTripModalError("End date cannot be before start date.");
      return false;
    }

    const startDate = new Date(modalFormData.startDate);
    const endDate = modalFormData.endDate ? new Date(modalFormData.endDate) : null;
  
    const invalidDate = allDates.find((item) => {
      if (item.type === "detail") {
        const detailDate = new Date(item.date);
        return (
          detailDate < startDate ||
          (endDate && detailDate > endDate)
        );
      }
      return false;
    });
  
    if (invalidDate) {
      setTripModalError("Some trip details fall outside the selected date range.");
      return false;
    }

    return true;
  };
  
  const updateDetails = async () => {
    if (!validateForm()) 
      return;

    const updateData = { ...modalFormData };
    if (updateData.completed && !updateData.endDate) {
      updateData.endDate = new Date().toISOString();
    }
    if (!updateData.completed) 
      updateData.endDate = null;

    try {
      await updateTripDetails(updateData);
      toast.success("Trip details updated successfully!");
      setOpenTripModal(false);
      fetchTripDetails();
    } catch (error) {
      toast.error("Failed to update trip details.");
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, []);  

  const handleActivityFormChange = (e) => {
    setActivityFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateActivityForm = async () => {
      if (!activityFormData.note.trim()) {
        setActivityModalError("Note is required.");
        return false;
      }
      if (!activityFormData.date) {
        setActivityModalError("Date is required.");
        return false;
      }
      if (activityFormData.date < formatDateForInput(tripDetails.startDate)) {
        setActivityModalError("Date cannot be before start date.");
        return false;
      } 
      if (tripDetails.endDate && activityFormData.date > formatDateForInput(tripDetails.endDate)) {
        setActivityModalError("Date cannot be after end date.");
        return false;
      }
      if (!activityFormData.location.trim()) {
        activityFormData.location = tripDetails.location;
        toast.error("Location not provided. Setting to " + activityFormData.location);
      }
  
      return true;
    }
  
    const handleActivitySubmit = async (event) => {
      if (!await validateActivityForm()) {
        return;
      }
      try {
        await addNewTripActivity(id, activityFormData);
        await fetchTripDetails();
        setOpenActivityModal(false);
        toast.success("Added new activity");
      } catch (err) {
        console.log(err);
        if (err.response?.status == 500) {
          setActivityModalError("Server error. Try again later.")
        } else {
          setActivityModalError("Failed to add new detail. Try again.");
        }
      }
    };

  if (fetchError) {
    return (
      <div className="text-center mt-24">
        <Typography variant="h4">Failed to fetch trip details.</Typography>
        <Button className="mt-4" onClick={fetchTripDetails}>Try Again</Button>
      </div>
    );
  }

  if (!tripDetails || !tripDetails.name) 
    {
    return (
      <div className="mx-[calc(100%/2)] my-[calc(100%/4)]">
        <ClipLoader/>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-4">
    <Card className="max-w-6xl mx-auto mt-10 p-6 space-y-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-x-4">
            <Typography variant="h3" color="blue-gray" className="flex-shrink-0">
              {tripDetails.name}
            </Typography>
          </div>
          <Typography variant="h6" color="gray">{tripDetails.location}</Typography>
          <Typography color="blue-gray">
            {tripDetails.startDate} — {tripDetails.endDate || "Ongoing"}
          </Typography>
          <div className="flex items-center gap-x-2 mt-1">
          <Typography variant="small" color="gray">
            Code: {tripDetails.tripCode}
          </Typography>
          <DocumentDuplicateIcon
            className="w-4 h-4 cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => navigator.clipboard.writeText(tripDetails.tripCode)}
          />
        </div>
        </div>

        {tripDetails.isAdmin && (
          <PencilIcon
            className="w-6 h-6 cursor-pointer text-gray-700"
            onClick={openEditModal}
          />
        )}
      </div>

      <hr className="my-6 border-gray-300" />
      <Typography variant="h4" color="blue-gray">Participants</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {tripDetails.participants.map((friend) => (
              <Card key={friend.userId} className="flex flex-row items-center p-4 gap-4">
                {<UserIcon className="w-6 h-6"/>}
                <div className="flex-1">
                  <Typography>{friend.username == user.username ? "You" : friend.username}</Typography>
                </div>
                {tripDetails.isAdmin && <TrashIcon
                  className="w-5 h-5 cursor-pointer"
                  onClick={async () => { try {
                    await removeFromTrip(id, friend.userId);
                    toast.success("Participant removed!");
                    if (friend.username == user.username) {
                      navigate('/dashboard');
                    } else {
                      fetchTripDetails();
                    }
                  } catch (e) {
                    toast.error("Failed to remove participant");
                  }
                  }}
                />}
              </Card>
            ))}
          </div>
          <Typography variant="h4" className="mb-2 ml-2" color="blue-gray">Invite to trip</Typography>
            <Card >
              <CardBody>
              <div className="flex flex-col items-start gap-2 max-w-xl mb-6">
              <Input
                label="Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={async () => {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (inviteEmail && !emailPattern.test(inviteEmail)) {
                  return;
                }
                try {
                  await inviteToTrip(id, inviteEmail);
                  toast.success("Sent request");
                  fetchTripDetails();
                } catch (e) {
                  console.log(e);
                  toast.error("Failed to send request");
                }
              }}>Send Request</Button>
              </div>
    
              </CardBody>
            </Card>
        
      <div>
      <div className="mb-12 grid grid-cols-1 gap-y-10 gap-x-6 md:grid-cols-2">
        {tripDetails.joinRequests.length != 0 && (
        <div>
           <Typography variant="h4" className="mb-2 ml-2" color="blue-gray">Join requests</Typography>
        {tripDetails.joinRequests.map(user => (
              <Card className="p-4 space-y-3">
              <div
                key={user.userId}
                className="flex justify-between items-center"
                >
                <div className="flex gap-2">{<UserIcon className="w-6 h-6"/>}<Typography>{user.username}</Typography></div>
                {tripDetails.isAdmin && <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => { try {
                      await addToTrip(id, user.userId);
                      toast.success("User added");
                      fetchTripDetails();
                    } catch (e) {
                      toast.error("Failed to add user details");
                    }
                    }}
                    >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    color="red"
                    onClick={async () => { try {
                      await removeFromTrip(id, user.userId);
                      toast.success("User declined.");
                      fetchTripDetails();
                    } catch (e) {
                      toast.error("Failed to decline user");
                    }
                    }}
                    >
                    Decline
                  </Button>
                </div>}
              </div>
          </Card>
        ))}
        </div>)}
        
        {tripDetails.sharedWith.length != 0 && (
          <div> 
            <Typography variant="h4" className="mb-2 ml-2" color="blue-gray">Shared with</Typography>
            {tripDetails.sharedWith.map(user => (
              <Card className="p-4 space-y-3">
              <div
                key={user.userId}
                className="flex justify-between items-center"
                >
                <div className="flex gap-2">{<UserIcon className="w-6 h-6"/>}<Typography>{user.username}</Typography></div>
                {tripDetails.isAdmin && <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="red"
                    onClick={async () => { try {
                      await removeFromTrip(id, user.userId);
                      toast.success("User declined.");
                      fetchTripDetails();
                    } catch (e) {
                      toast.error("Failed to decline user");
                    }
                    }}
                    >
                    Remove
                  </Button>
                </div>}
              </div>
          </Card>
        ))}
        </div>)}
      </div>
      </div>

      <Typography variant="h4" color="blue-gray" className="pt-6 pb-2">Activities</Typography>
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        { allDates.map((item, idx) => {
          if (item.type === "detail") {
            const { location } = item.data;
            return <div
            key={idx}
            onClick={() => {
              navigate(`/dashboard/trip/details/${formatDateForInput(item.date)}/${id}`)
            }
            }
            >
            <TripCard
              key={idx}
              title={item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              color="white"
              value={`Day ${Math.floor((item.date - new Date(tripDetails.startDate)) / (1000 * 60 * 60 * 24)) + 1}`}
              icon={<ArrowRightCircleIcon className="w-12 h-12 text-black " />}
              footer={
                <Typography className="font-normal text-sm text-blue-gray-600">
                  {location}
                </Typography>
              }
            />
            </div>
        } else {
            return <div
              key={idx}
              onClick={() => {
                setActivityFormData(prev => ({
                  note: "",
                  date: formatDateForInput(item.date),
                  location: "",
                  activities: "",
                }));
                setOpenActivityModal(true);
                setActivityModalError("");
              }
              }
            >
              <TripCard
                title={item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                color="white"
                value={`Day ${Math.floor((item.date - new Date(tripDetails.startDate)) / (1000 * 60 * 60 * 24)) + 1}`}
                icon={<PlusCircleIcon className="w-12 h-12 text-gray-600" />}
                footer={<Typography className="font-normal text-sm text-blue-gray-600">Add a new detail</Typography>}
              />
            </div>
        }  })}
        <div
              key={"new activity"}
              onClick={() => {
                setActivityFormData(prev => ({
                  note: "",
                  date: "",
                  location: "",
                  activities: "",
                }));
                setOpenActivityModal(true);
                setActivityModalError("");
              }
              }
            >
              <TripCard
                title={"New detail"}
                color="white"
                value={"New"}
                icon={<PlusCircleIcon className="w-12 h-12 text-gray-600" />}
                footer={<Typography className="font-normal text-sm text-blue-gray-600">Add a new detail</Typography>}
              />
            </div>
      </div>
    </Card>

    <Dialog open={openTripModal} handler={() => setOpenTripModal(false)} size="sm" className="p-8">
      <DialogHeader>Edit Trip Details</DialogHeader>
      <DialogBody className="space-y-4">
        {Object.keys(tripDetails).map((key) =>
          labels[key] ? (
            <Input
              key={key}
              label={labels[key]}
              name={key}
              value={modalFormData[key] || ""}
              type={key === "startDate" || key === "endDate" ? "date" : "text"}
              onChange={handleModalChange}
            />
          ) : null
        )}
        <div>
          <Select
            label="Visibility"
            value={modalFormData.visibility || "private"}
            onChange={(value) => setModalFormData({ ...modalFormData, visibility: value })}
          >
            <Option value="private">Private</Option>
            <Option value="friends">Friends</Option>
          </Select>
        </div>
        <Checkbox
          label="Completed"
          name="completed"
          checked={modalFormData.completed || false}
          onChange={handleModalChange}
        />
        {
          tripModalError && (
            <Typography color="red" className="text-sm mt-2">
            {tripModalError}
            </Typography>
          )
        }
      </DialogBody>
      <DialogFooter>
        <Button color="blue-gray" variant="text" onClick={() => setOpenTripModal(false)}>Cancel</Button>
        <Button color="blue" onClick={updateDetails}>Save</Button>
      </DialogFooter>
    </Dialog>

    <Dialog open={openActivityModal} handler={() => setOpenActivityModal(false)} size="sm" className="p-8">
      <DialogHeader>Add Trip Activity</DialogHeader>
      <DialogBody className="space-y-4">
      <Input
        label="Note"
        name="note"
        value={activityFormData.note}
        onChange={handleActivityFormChange}
        required
      />

      <Input
        label="Date"
        name="date"
        value={activityFormData.date}
        onChange={handleActivityFormChange}
        type="date"
        required
      />

      <Input
        label="Location"
        name="location"
        value={activityFormData.location}
        onChange={handleActivityFormChange}
        required
      />

      <Textarea
        label="Activities"
        name="activities"
        value={activityFormData.activities}
        onChange={handleActivityFormChange}
      />
      {
        activityModalError && (
          <Typography color="red" className="text-sm mt-2">
          {activityModalError}
          </Typography>
        )
      }
      </DialogBody>
      <DialogFooter>
        <Button color="blue-gray" variant="text" onClick={() => setOpenActivityModal(false)}>Cancel</Button>
        <Button color="blue" onClick={handleActivitySubmit}>Add activity</Button>
      </DialogFooter>
    </Dialog>
  </div>
    );
}

export default Trip;
