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
} from "@material-tailwind/react";
import { PencilIcon, ArrowRightCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { getTripDetails, updateTripDetails } from "@/util/api";
import { ClipLoader } from "react-spinners";
import { TripCard } from "@/widgets/cards";

import toast from "react-hot-toast";

export function Trip() {
  const { id } = useParams();
  const [tripDetails, setTripDetails] = useState({});
  const [modalFormData, setModalFormData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [modalError, setModalError] = useState("");
  const [allDates, setAllDates] = useState([]);

  const navigate = useNavigate();

  const labels = useMemo(() => ({
    name: "Trip Name",
    location: "Location",
    startDate: "Start Date",
    endDate: "End Date",
  }), []);

  const excludeLabels = useMemo(() => (["tripCode", "details", "favorited", "isAdmin", "completed"]), []);

  const getMissingDates = (start, end, existingDetails) => {
    const missing = [];
    const existingDates = new Set(existingDetails.map(detail => new Date(detail.date).toDateString()));
  
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(); // if no end date, till today
  
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
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
      end,
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
    setOpenModal(true);
    setModalError("");
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
      setModalError("Location is required.");
      return false;
    }
    if (!modalFormData.startDate) {
      setModalError("Start date is required.");
      return false;
    }
    if (modalFormData.endDate && modalFormData.endDate < modalFormData.startDate) {
      setModalError("End date cannot be before start date.");
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
      setOpenModal(false);
      fetchTripDetails();
    } catch (error) {
      toast.error("Failed to update trip details.");
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, []);  

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
        </div>

        {tripDetails.isAdmin && (
          <PencilIcon
            className="w-6 h-6 cursor-pointer text-gray-700"
            onClick={openEditModal}
          />
        )}
      </div>

      <hr className="my-6 border-gray-300" />

      <Typography variant="h4" color="blue-gray" className="pt-6 pb-2">Activities</Typography>
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        { allDates.map((item, idx) => {
          if (item.type === "detail") {
            const { date, note, location, activities } = item.data;
            return <TripCard
              key={idx}
              title={item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              color="white"
              value={note}
              icon={<ArrowRightCircleIcon className="w-12 h-12 text-gray-950" />}
              footer={
                <Typography className="font-normal text-sm text-blue-gray-600">
                  {location}: {activities}
                </Typography>
              }
            />
        } else {
            return <div
              key={idx}
              onClick={() =>
                navigate(`/dashboard/trip/details/new/${tripDetails.tripCode}`, {
                  state: { selectedDate: formatDateForInput(item.date) },
                })
              }
            >
              <TripCard
                title={item.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                color="white"
                value={`Day ${Math.floor((item.date - new Date(tripDetails.startDate)) / (1000 * 60 * 60 * 24)) + 1}`}
                icon={<PlusCircleIcon className="w-12 h-12 text-gray-950" />}
                footer={<Typography className="font-normal text-sm text-blue-gray-600">Add a new detail</Typography>}
              />
            </div>
        }  })}
      </div>
    </Card>

    <Dialog open={openModal} handler={() => setOpenModal(false)} size="sm" className="p-8">
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
        <Checkbox
          label="Completed"
          name="completed"
          checked={modalFormData.completed || false}
          onChange={handleModalChange}
        />
        {
          modalError && (
            <Typography color="red" className="text-sm mt-2">
            {modalError}
            </Typography>
          )
        }
      </DialogBody>
      <DialogFooter>
        <Button color="blue-gray" variant="text" onClick={() => setOpenModal(false)}>Cancel</Button>
        <Button color="blue" onClick={updateDetails}>Save</Button>
      </DialogFooter>
    </Dialog>
  </div>
    );
}

export default Trip;
