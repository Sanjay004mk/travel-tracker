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
  IconButton,
} from "@material-tailwind/react";
import {
  PencilIcon,
  ArrowRightCircleIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
  UserIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  getTripDetails,
  updateTripDetails,
  addNewTripActivity,
  removeFromTrip,
  inviteToTrip,
  addToTrip,
  getTripExpense,
  addExpense,
  editExpense,
} from "@/util/api";
import { ClipLoader } from "react-spinners";
import { TripCard } from "@/widgets/cards";

import toast from "react-hot-toast";
import { useMaterialTailwindController } from "@/context";

export function Trip() {
  const { id } = useParams();
  const { user } = useMaterialTailwindController();
  const [tripDetails, setTripDetails] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [newExpenseDetails, setNewExpenseDetails] = useState({});
  const [editExpenseDetails, setEditExpenseDetails] = useState({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [modalFormData, setModalFormData] = useState({});
  const [openTripModal, setOpenTripModal] = useState(false);
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [tripModalError, setTripModalError] = useState("");
  const [expenseModalError, setExpenseModalError] = useState("");
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

  const labels = useMemo(
    () => ({
      name: "Trip Name",
      location: "Location",
      startDate: "Start Date",
      endDate: "End Date",
    }),
    [],
  );

  const excludeLabels = useMemo(
    () => ["tripCode", "details", "favorited", "isAdmin", "completed"],
    [],
  );

  const formatDateWithTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMissingDates = (start, existingDetails) => {
    const missing = [];
    const existingDates = new Set(
      existingDetails.map((detail) => new Date(detail.date).toDateString()),
    );

    const startDate = new Date(start);

    const lastExistingDate = existingDetails.length
      ? new Date(
          Math.max(...existingDetails.map((detail) => new Date(detail.date))),
        )
      : startDate;

    for (
      let d = new Date(startDate);
      d <= lastExistingDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (!existingDates.has(d.toDateString())) {
        missing.push(new Date(d));
      }
    }

    return missing;
  };

  const updateAllDates = (details, start, end) => {
    const detailDates = details.map((detail) => ({
      type: "detail",
      date: new Date(detail.date),
      data: detail,
    }));

    const missingDates = getMissingDates(start, details).map((date) => ({
      type: "missing",
      date: new Date(date),
    }));
    setAllDates(
      [...detailDates, ...missingDates].sort((a, b) => a.date - b.date),
    );
  };

  const fetchExpenses = async () => {
    try {
      const { data } = await getTripExpense(id);
      setExpenses(data.expenses);
      let newTotal = 0;
      data.expenses.forEach((expense) => {
        newTotal += expense.amount;
      });
      setTotalExpense(newTotal);
      setFetchError(false);
    } catch (e) {
      console.log(e);
      setFetchError(true);
    }
  };

  const handleExpenseChange = (setter, event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSplitChange = (setter, event, index) => {
    const { value } = event.target;
    setter((prev) => {
      const newSplit = [...prev.splitBetween];
      newSplit[index] = value;
      return { ...prev, splitBetween: newSplit };
    });
  };

  const handleRemoveFromSplit = (setter, event, index) => {
    setter((prev) => {
      const removeValue = prev.splitBetween[index];
      const newSplit = prev.splitBetween.filter((user) => user != removeValue);
      return { ...prev, splitBetween: newSplit };
    });
  };

  const handleAddToSplit = (setter, event) => {
    setter((prev) => {
      if (!prev.newUser || prev.newUser.trim().length == 0) return prev;

      let newSplit;
      if (prev.splitBetween) {
        newSplit = [...prev.splitBetween];
        if (!newSplit.includes(prev.newUser)) {
          newSplit.push(prev.newUser);
        }
      } else {
        newSplit = [prev.newUser];
      }
      return { ...prev, splitBetween: newSplit, newUser: "" };
    });
  };

  const handleOpenEditExpense = (idx) => {
    const expense = structuredClone(expenses[idx]);
    expense.date = new Date(expense.date).toISOString().slice(0, 16);
    expense.splitBetween = expense.splitBetween.map((user) => user.username);
    expense.paidBy = expense.paidBy.username;
    setEditExpenseDetails(expense);
    setOpenEditExpenseModal(true);
    setExpenseModalError("");
  };

  const validExpense = (expense) => {
    if (!isFinite(expense.amount) || expense.amount <= 0) {
      console.log(expense.amount);
      toast.error("Invalid amount");
      return false;
    }

    const detailDate = new Date(expense.date);
    if (isNaN(detailDate.getTime())) {
      toast.error("Invalid date");
      return false;
    }

    const tripStart = new Date(tripDetails.startDate);

    if (detailDate < tripStart) {
      toast.error("Date before trip start");
      return false;
    }

    if (!expense.paidBy || expense.paidBy.trim().length == 0) {
      toast.error("Paid by can't be empty");
      return false;
    }

    if (typeof expense.splitBetween === "string") {
      expense.splitBetween = expense.splitBetween
        .split(",")
        .map((u) => u.trim());
    }

    if (!expense.splitBetween.every((user) => user.trim().length != 0)) {
      return false;
    }

    return true;
  };

  const handleAddNewExpense = async () => {
    if (!validExpense(newExpenseDetails)) {
      return;
    }

    try {
      await addExpense(id, newExpenseDetails);
      toast.success("Added new expense");
      setNewExpenseDetails({});
      fetchExpenses();
    } catch (e) {
      console.log(e);
      toast.error("Failed to add expense");
    }
  };

  const handleEditExpense = async () => {
    if (!validExpense(editExpenseDetails)) {
      return;
    }
    try {
      await editExpense(id, editExpenseDetails);
      toast.success("Edited expense");
      setEditExpenseDetails({});
      setOpenEditExpenseModal(false);
      fetchExpenses();
    } catch (e) {
      console.log(e);
      toast.error("Failed to edit expense");
    }
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
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openEditModal = () => {
    const formData = { ...tripDetails };
    formData.startDate = formatDateForInput(formData.startDate);
    formData.endDate = formData.endDate
      ? formatDateForInput(formData.endDate)
      : "";
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
    if (
      modalFormData.endDate &&
      modalFormData.endDate < modalFormData.startDate
    ) {
      setTripModalError("End date cannot be before start date.");
      return false;
    }

    const startDate = new Date(modalFormData.startDate);
    const endDate = modalFormData.endDate
      ? new Date(modalFormData.endDate)
      : null;

    const invalidDate = allDates.find((item) => {
      if (item.type === "detail") {
        const detailDate = new Date(item.date);
        return detailDate < startDate || (endDate && detailDate > endDate);
      }
      return false;
    });

    if (invalidDate) {
      setTripModalError(
        "Some trip details fall outside the selected date range.",
      );
      return false;
    }

    return true;
  };

  const updateDetails = async () => {
    if (!validateForm()) return;

    const updateData = { ...modalFormData };
    if (updateData.completed && !updateData.endDate) {
      updateData.endDate = new Date().toISOString();
    }
    if (!updateData.completed) updateData.endDate = null;

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
    fetchExpenses();
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
    if (
      tripDetails.endDate &&
      activityFormData.date > formatDateForInput(tripDetails.endDate)
    ) {
      setActivityModalError("Date cannot be after end date.");
      return false;
    }
    if (!activityFormData.location.trim()) {
      activityFormData.location = tripDetails.location;
      toast.error(
        "Location not provided. Setting to " + activityFormData.location,
      );
    }

    return true;
  };

  const handleActivitySubmit = async (event) => {
    if (!(await validateActivityForm())) {
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
        setActivityModalError("Server error. Try again later.");
      } else {
        setActivityModalError("Failed to add new detail. Try again.");
      }
    }
  };

  if (fetchError) {
    return (
      <div className="mt-24 text-center">
        <Typography variant="h4">Failed to fetch trip details.</Typography>
        <Button className="mt-4" onClick={fetchTripDetails}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!tripDetails || !tripDetails.name) {
    return (
      <div className="mx-[calc(100%/2)] my-[calc(100%/4)]">
        <ClipLoader />
      </div>
    );
  }

  return (
    <div className="mt-4 min-h-screen">
      <Card className="mx-auto mt-10 max-w-6xl space-y-6 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-x-4">
              <Typography
                variant="h3"
                color="blue-gray"
                className="flex-shrink-0"
              >
                {tripDetails.name}
              </Typography>
            </div>
            <Typography variant="h6" color="gray">
              {tripDetails.location}
            </Typography>
            <Typography color="blue-gray">
              {tripDetails.startDate} — {tripDetails.endDate || "Ongoing"}
            </Typography>
            <div className="mt-1 flex items-center gap-x-2">
              <Typography variant="small" color="gray">
                Code: {tripDetails.tripCode}
              </Typography>
              <DocumentDuplicateIcon
                className="h-4 w-4 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() =>
                  navigator.clipboard.writeText(tripDetails.tripCode)
                }
              />
            </div>
          </div>

          {tripDetails.isAdmin && (
            <PencilIcon
              className="h-6 w-6 cursor-pointer text-gray-700"
              onClick={openEditModal}
            />
          )}
        </div>

        <hr className="my-6 border-gray-300" />
        <div>
          <Typography variant="h4" color="blue-gray">
            Participants ({tripDetails.participants.length})
          </Typography>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {tripDetails.participants.map((friend) => (
              <Card
                key={friend.userId}
                className="flex flex-row items-center gap-4 p-4 shadow-none border border-gray-400"
              >
                {<UserIcon className="h-6 w-6" />}
                <div className="flex-1">
                  <Typography>
                    {friend.username == user.username ? "You" : friend.username}
                  </Typography>
                </div>
                {tripDetails.isAdmin && (
                  <TrashIcon
                    className="h-5 w-5 cursor-pointer"
                    onClick={async () => {
                      try {
                        await removeFromTrip(id, friend.userId);
                        toast.success("Participant removed!");
                        if (friend.username == user.username) {
                          navigate("/dashboard");
                        } else {
                          fetchTripDetails();
                        }
                      } catch (e) {
                        toast.error("Failed to remove participant");
                      }
                    }}
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
        <hr className="my-6 border-gray-300" />
        <div>
          <Typography variant="h4" color="blue-gray">
            Invite to trip
          </Typography>
          <Card className="shadow-none ">
            <CardBody>
              <div className="flex max-w-xl flex-col items-start gap-2">
                <Input
                  label="Email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={async () => {
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
                  }}
                >
                  Send Request
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {tripDetails.joinRequests.length != 0 &&
          tripDetails.sharedWith.length != 0 && (
            <div className="mb-12 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
              {tripDetails.joinRequests.length != 0 && (
                <div>
                  <Typography
                    variant="h4"
                    className="mb-2 ml-2"
                    color="blue-gray"
                  >
                    Join requests
                  </Typography>
                  <div>
                    {tripDetails.joinRequests.map((user) => (
                      <Card className="space-y-3 p-4">
                        <div
                          key={user.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex gap-2">
                            {<UserIcon className="h-6 w-6" />}
                            <Typography>{user.username}</Typography>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
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
                              onClick={async () => {
                                try {
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
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {tripDetails.sharedWith.length != 0 && (
                <div>
                  <Typography
                    variant="h4"
                    className="mb-2 ml-2"
                    color="blue-gray"
                  >
                    Shared with
                  </Typography>
                  <div>
                    {tripDetails.sharedWith.map((user) => (
                      <Card className="space-y-3 p-4">
                        <div
                          key={user.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex gap-2">
                            {<UserIcon className="h-6 w-6" />}
                            <Typography>{user.username}</Typography>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="red"
                              onClick={async () => {
                                try {
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
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        <Typography variant="h4" color="blue-gray" className="pb-2 pt-6">
          Activities
        </Typography>
        <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
          {allDates.map((item, idx) => {
            if (item.type === "detail") {
              const { location } = item.data;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(
                      `/dashboard/trip/details/${formatDateForInput(
                        item.date,
                      )}/${id}`,
                    );
                  }}
                >
                  <TripCard
                    key={idx}
                    title={item.date.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    color="white"
                    value={`Day ${
                      Math.floor(
                        (item.date - new Date(tripDetails.startDate)) /
                          (1000 * 60 * 60 * 24),
                      ) + 1
                    }`}
                    icon={
                      <ArrowRightCircleIcon className="h-12 w-12 text-black " />
                    }
                    footer={
                      <Typography className="text-sm font-normal text-blue-gray-600">
                        {location}
                      </Typography>
                    }
                  />
                </div>
              );
            } else {
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActivityFormData((prev) => ({
                      note: "",
                      date: formatDateForInput(item.date),
                      location: "",
                      activities: "",
                    }));
                    setOpenActivityModal(true);
                    setActivityModalError("");
                  }}
                >
                  <TripCard
                    title={item.date.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    color="white"
                    value={`Day ${
                      Math.floor(
                        (item.date - new Date(tripDetails.startDate)) /
                          (1000 * 60 * 60 * 24),
                      ) + 1
                    }`}
                    icon={
                      <PlusCircleIcon className="h-12 w-12 text-gray-600" />
                    }
                    footer={
                      <Typography className="text-sm font-normal text-blue-gray-600">
                        Add a new detail
                      </Typography>
                    }
                  />
                </div>
              );
            }
          })}
          <div
            key={"new activity"}
            onClick={() => {
              setActivityFormData((prev) => ({
                note: "",
                date: "",
                location: "",
                activities: "",
              }));
              setOpenActivityModal(true);
              setActivityModalError("");
            }}
          >
            <TripCard
              title={"New detail"}
              color="white"
              value={"New"}
              icon={<PlusCircleIcon className="h-12 w-12 text-gray-600" />}
              footer={
                <Typography className="text-sm font-normal text-blue-gray-600">
                  Add a new detail
                </Typography>
              }
            />
          </div>
        </div>
        <div>
          <Typography variant="h4" color="blue-gray">
            Expenses (Total: ₹{totalExpense})
          </Typography>
          {expenses.length != 0 && (
            <div className="mt-4 grid-cols-1 gap-y-2 overflow-scroll">
              <Card>
                <table className="w-full min-w-max table-auto text-left">
                  <thead> 
                    <tr>
                      <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70 font-bold"
                        >
                          Date
                        </Typography>
                      </th>
                      <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70 font-bold"
                        >
                          Paid By
                        </Typography>
                      </th>
                      <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70 font-bold"
                        >
                          Amount
                        </Typography>
                      </th>
                      <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70 font-bold"
                        >
                          Description
                        </Typography>
                      </th>
                      <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal leading-none opacity-70 font-bold"
                        >
                          Split Between
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(
                      ({ amount, paidBy, splitBetween, date, description }, index) => {
                        return (
                          <tr className={(index % 2 == 0) ? "bg-gray-200" : "bg-gray-100"}>
                            <td className="border-b border-blue-gray-50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {formatDateWithTime(date)}
                              </Typography>
                            </td>
                            <td className="border-b border-blue-gray-50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {paidBy.username}
                              </Typography>
                            </td>
                            <td className="border-b border-blue-gray-50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {amount}
                              </Typography>
                            </td>
                            <td className="border-b border-blue-gray-50 p-4">
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal"
                              >
                                {description}
                              </Typography>
                            </td>
                            <td className="border-b border-blue-gray-50 p-4">
                              <Typography
                                as="a"
                                href="#"
                                variant="small"
                                color="blue-gray"
                                className="font-medium"
                              >
                                {splitBetween
                                  .map((user) => user.username)
                                  .join(", ")}
                              </Typography>
                            </td>
                            {tripDetails.isAdmin && (
                              <td className="border-b border-blue-gray-50 p-4">
                                <Typography
                                  as="a"
                                  href="#"
                                  variant="small"
                                  color="blue-gray"
                                  className="font-medium"
                                >
                                  <IconButton
                                    variant="text"
                                    onClick={() => {
                                      handleOpenEditExpense(index);
                                    }}
                                  >
                                    <PencilIcon className="h-3 w-3   text-gray-600" />
                                  </IconButton>
                                </Typography>
                              </td>
                            )}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
          <Typography variant="h4" className="mt-6" color="blue-gray">
            Add new expense
          </Typography>
          <Card className="shadow-none">
            <CardBody className="mt-4 flex max-w-xl flex-col gap-y-4">
              <Input
                label="Amount"
                type="number"
                name="amount"
                value={newExpenseDetails.amount}
                onChange={(e) => handleExpenseChange(setNewExpenseDetails, e)}
                size="lg"
                className="flex-1"
              />
              <Input
                label="Paid by"
                type="text"
                name="paidBy"
                value={newExpenseDetails.paidBy}
                onChange={(e) => handleExpenseChange(setNewExpenseDetails, e)}
                size="lg"
                className="flex-1"
              />
              <Input
                label="Description"
                type="text"
                name="description"
                value={newExpenseDetails.description}
                onChange={(e) => handleExpenseChange(setNewExpenseDetails, e)}
                size="lg"
                className="flex-1"
              />
              <Input
                label="Date time"
                type="datetime-local"
                name="date"
                value={newExpenseDetails.date}
                onChange={(e) => handleExpenseChange(setNewExpenseDetails, e)}
                size="lg"
                className="flex-1"
              />
              {newExpenseDetails.splitBetween &&
                newExpenseDetails.splitBetween.map((user, idx) => (
                  <div className="flex gap-2" key={`split-user-${idx}`}>
                    <Input
                      key={`new-user-edit-${idx}`}
                      label="Split"
                      type="text"
                      name={`user-${idx}`}
                      value={user}
                      onChange={(e) =>
                        handleSplitChange(setNewExpenseDetails, e, idx)
                      }
                      size="lg"
                      className="flex-1"
                    />
                    <Button
                      key={`new-user-remove-button-${idx}`}
                      onClick={(e) =>
                        handleRemoveFromSplit(setNewExpenseDetails, e, idx)
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              <div className="flex gap-2">
                <Input
                  label="Split"
                  type="text"
                  name="newUser"
                  value={newExpenseDetails.newUser}
                  onChange={(e) => handleExpenseChange(setNewExpenseDetails, e)}
                  size="lg"
                  className="flex-1"
                />
                <Button
                  onClick={(e) => handleAddToSplit(setNewExpenseDetails, e)}
                >
                  Add
                </Button>
              </div>
              <Button onClick={handleAddNewExpense}>Add</Button>
            </CardBody>
          </Card>
        </div>
      </Card>

      <Dialog
        open={openTripModal}
        handler={() => setOpenTripModal(false)}
        size="sm"
        className="p-8"
      >
        <DialogHeader>Edit Trip Details</DialogHeader>
        <DialogBody className="space-y-4">
          {Object.keys(tripDetails).map((key) =>
            labels[key] ? (
              <Input
                key={key}
                label={labels[key]}
                name={key}
                value={modalFormData[key] || ""}
                type={
                  key === "startDate" || key === "endDate" ? "date" : "text"
                }
                onChange={handleModalChange}
              />
            ) : null,
          )}
          <div>
            <Select
              label="Visibility"
              value={modalFormData.visibility || "private"}
              onChange={(value) =>
                setModalFormData({ ...modalFormData, visibility: value })
              }
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
          {tripModalError && (
            <Typography color="red" className="mt-2 text-sm">
              {tripModalError}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            color="blue-gray"
            variant="text"
            onClick={() => setOpenTripModal(false)}
          >
            Cancel
          </Button>
          <Button color="blue" onClick={updateDetails}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={openActivityModal}
        handler={() => setOpenActivityModal(false)}
        size="sm"
        className="p-8"
      >
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
          {activityModalError && (
            <Typography color="red" className="mt-2 text-sm">
              {activityModalError}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            color="blue-gray"
            variant="text"
            onClick={() => setOpenActivityModal(false)}
          >
            Cancel
          </Button>
          <Button color="blue" onClick={handleActivitySubmit}>
            Add activity
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={openEditExpenseModal}
        handler={() => setOpenEditExpenseModal(false)}
        size="sm"
        className="p-2"
      >
        <DialogHeader>Edit Expense Details</DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Amount"
            type="number"
            name="amount"
            value={editExpenseDetails.amount}
            onChange={(e) => handleExpenseChange(setEditExpenseDetails, e)}
            size="lg"
            className="flex-1"
          />
          <Input
            label="Paid by"
            type="text"
            name="paidBy"
            value={editExpenseDetails.paidBy}
            onChange={(e) => handleExpenseChange(setEditExpenseDetails, e)}
            size="lg"
            className="flex-1"
          />
          <Input
            label="Description"
            type="text"
            name="description"
            value={editExpenseDetails.description}
            onChange={(e) => handleExpenseChange(setEditExpenseDetails, e)}
            size="lg"
            className="flex-1"
          />
          <Input
            label="Date time"
            type="datetime-local"
            name="date"
            value={editExpenseDetails.date}
            onChange={(e) => handleExpenseChange(setEditExpenseDetails, e)}
            size="lg"
            className="flex-1"
          />
          {editExpenseDetails.splitBetween &&
            editExpenseDetails.splitBetween.map((user, idx) => (
              <div className="flex gap-2">
                <Input
                  key={`user-edit-${idx}`}
                  label="Split"
                  type="text"
                  name={`user-${idx}`}
                  value={user}
                  onChange={(e) =>
                    handleSplitChange(setEditExpenseDetails, e, idx)
                  }
                  size="lg"
                  className="flex-1"
                />
                <Button
                  key={`user-remove-button-${idx}`}
                  onClick={(e) =>
                    handleRemoveFromSplit(setEditExpenseDetails, e, idx)
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          <div className="flex gap-2">
            <Input
              label="Split"
              type="text"
              name="newUser"
              value={editExpenseDetails.newUser}
              onChange={(e) => handleExpenseChange(setEditExpenseDetails, e)}
              size="lg"
              className="flex-1"
            />
            <Button onClick={(e) => handleAddToSplit(setEditExpenseDetails, e)}>
              Add
            </Button>
          </div>
          {expenseModalError && (
            <Typography color="red" className="mt-2 text-sm">
              {expenseModalError}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            color="blue-gray"
            variant="text"
            onClick={() => setOpenEditExpenseModal(false)}
          >
            Cancel
          </Button>
          <Button color="blue" onClick={handleEditExpense}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Trip;
