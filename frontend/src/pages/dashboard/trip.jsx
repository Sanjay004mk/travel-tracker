import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  List,
  ListItem,
  Chip,
  Input,
} from "@material-tailwind/react";
import { PencilIcon, ArrowRightCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { getTripDetails, updateTripDetails } from "@/util/api";
import { ClipLoader } from "react-spinners";
import { TripCard } from "@/widgets/cards";

export function Trip() {
  // const [showAlerts, setShowAlerts] = React.useState({
  //   blue: true,
  //   green: true,
  //   orange: true,
  //   red: true,
  // });
  // const [showAlertsWithIcon, setShowAlertsWithIcon] = React.useState({
  //   blue: true,
  //   green: true,
  //   orange: true,
  //   red: true,
  // });
  // const alerts = ["gray", "green", "orange", "red"];

  const {id} = useParams();

  const [tripDetails, setTripDetails] = useState({});

  const [edit, setEdit] = useState({});

  const navigate = useNavigate();

  const labels = useMemo(() => ({
    location: 'Location',
    startDate: 'Start Date',
    endDate: 'End Date',
  }), []);

  const excludeLabels = useMemo(() => (['name', 'tripCode', 'details', 'favorited', 'isAdmin', 'completed' ]), []);

  const disableEdit = () => {setEdit(() => {
    let obj = {};
    Object.keys(tripDetails).forEach((key) => {obj[key] = false});
    return obj;
  })}

  const setEnableEdit = (key, value, event) => {
    if (tripDetails && tripDetails.isAdmin){
      event.stopPropagation();
      setEdit(() => {
        let obj = {};
        Object.keys(tripDetails).forEach((key) => {obj[key] = false});
        obj[key] = value;
        return obj;
      })

    }
  }

  const updateDetails = () => {
    if (tripDetails) {
      updateTripDetails(tripDetails);
    }
  }

  const handleChange = (event) => {
    const {name, value} = event.target;
    setTripDetails(prev => ({...prev, [name]: value}));
  }

  useEffect(() => {
    const getDetails = async () => {
      try {
        const { data } = await getTripDetails(id);        
        if (!(data.trip.completed = !!data.trip.endDate)) {
          data.trip.endDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"})
        }
        setTripDetails(data.trip);
        let editObj = {};
        Object.keys(data.trip).forEach((key) => {
          editObj[key] = false
        });
        setEdit(editObj);
      } catch {
        setTripDetails({});
      }
    }
    getDetails();
  }, [])

  if (!tripDetails || !tripDetails.name) 
    {
    return (
      <div className="mx-[calc(100%/2)] my-[calc(100%/4)]">
        <ClipLoader/>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen mt-4">
      <Card className="max-w-6xl mx-auto mt-10 p-6 space-y-6 shadow-lg" onClick={disableEdit}>
      <div className="flex justify-between items-center">
        {edit['name'] ? (
          <div>
            <Input 
            placeholder={tripDetails.name}
            type="text"
            name="name"
            value={tripDetails.name}
            onChange={handleChange}
            onKeyDown={(event) => {
              if (event.key == 'Enter') {
                setEnableEdit('name', false, event);
                updateDetails();
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
          </div>
        ) :
          (<div className="flex flex-row items-start group" onClick={(event) => setEnableEdit('name', true, event)}>
        <Typography variant="h3" color="blue-gray">{tripDetails.name}</Typography>
        {tripDetails.isAdmin && <PencilIcon className="w-4 h-4 mt-2 mx-2 hidden group-hover:block"></PencilIcon>}
        </div>)
        }
        <Chip
          value={tripDetails.completed ? "Completed" : "Ongoing"}
          color={tripDetails.completed ? "green" : "blue"}
        />
      </div>
      <div className="min-w-full border-gray-700 border-b-2"></div>
      <div className="space-y-2">
        {
          Object.keys(tripDetails).map((key) => !excludeLabels.includes(key) &&  (
            <Typography key={key} color="blue-gray" className="flex flex-row items-start h-10 text-lg">
          <strong className="mr-2">{labels[key]}: </strong>
          {edit[key] ? (
          <div>
            <Input 
            placeholder={tripDetails[key]}
            type={key == 'startDate' || key == 'endDate' ? 'date' : 'text' }
            name={key}
            value={tripDetails[key]}
            onChange={handleChange}
            onKeyDown={(event) => {
              if (event.key == 'Enter') {
                console.log('yo')
                setEnableEdit(key, false, event);
                updateDetails();
              }
            }}
            onClick={(event) => {event.stopPropagation();}}
            className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
            />
          </div>
        ) :
          (<div className="flex flex-row items-start group" onClick={(event) => setEnableEdit(key, true, event)}>
        <Typography>{tripDetails[key]}</Typography>
        {tripDetails.isAdmin && <PencilIcon className="w-4 h-4 mt-1 mx-2 hidden group-hover:block"></PencilIcon>}
        </div>)
        }
        </Typography>
          ))
        }
      
      <div className="min-w-full border-gray-300 border-b-2 pt-4"></div>
      <Typography variant="h4" color="blue-gray" className="pt-6 pb-2">Details</Typography>
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
      {
        tripDetails.details.map(({ date, note, photos, location, activities }) => (
          <TripCard
        title={new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"})}
        color="white"
        value={note}
        icon={
          <ArrowRightCircleIcon className="w-12 h-12 text-gray-950"/>
        }
        footer={
          <Typography className="font-normal text-sm text-blue-gray-600">
            {location}: {activities}
          </Typography>
        }
        />
        ))
      }
      <div onClick={() => navigate(`/dashboard/trip/details/new/${tripDetails.tripCode}`)}>
      <TripCard
        title="New detail"
        color="white"
        value="New"
        icon={
          <PlusCircleIcon className="w-12 h-12 text-gray-950"/>
        }
        footer={
          <Typography className="font-normal text-sm text-blue-gray-600">
            Add a new detail
          </Typography>
        }
        />
      </div>
      </div>
        
{/* 
        <Typography color="blue-gray">
          <strong>Start:</strong> {tripDetails.startDate}
        </Typography>

        <Typography color="blue-gray">
          <strong>End:</strong> {tripDetails.endDate ? tripDetails.endDate : "On going"}
        </Typography> */}
        
        { // TODO : make toggle for admins
        /* <Typography color="blue-gray">
          <strong>Visibility:</strong> {tripDetails.visibility}
        </Typography> */}
      </div>

      { // TODO : implement
      /* <div>
        <Typography variant="h6">Participants</Typography>
        <List>
          {tripDetails.participants?.map((p, i) => (
            <ListItem key={i}>{p}</ListItem>
          ))}
        </List>
      </div> */}

      { // TODO : implement
      /* {tripDetails.expenses?.length > 0 && (
        <div>
          <Typography variant="h6">Expenses</Typography>
          <List>
            {tripDetails.expenses.map((exp, i) => (
              <ListItem key={i} className="flex flex-col items-start">
                <Typography>{exp.description} - ₹{exp.amount}</Typography>
                <Typography variant="small" color="gray">
                  Paid by: {exp.paidBy}
                </Typography>
              </ListItem>
            ))}
          </List>
        </div>
      )} */}
    </Card>

      </div>
    </>
  //   <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
  //     <Card>
  //       <CardHeader
  //         color="transparent"
  //         floated={false}
  //         shadow={false}
  //         className="m-0 p-4"
  //       >
  //         <Typography variant="h5" color="blue-gray">
  //           Alerts
  //         </Typography>
  //       </CardHeader>
  //       <CardBody className="flex flex-col gap-4 p-4">
  //         {alerts.map((color) => (
  //           <Alert
  //             key={color}
  //             open={showAlerts[color]}
  //             color={color}
  //             onClose={() => setShowAlerts((current) => ({ ...current, [color]: false }))}
  //           >
  //             A simple {color} alert with an <a href="#">example link</a>. Give
  //             it a click if you like.
  //           </Alert>
  //         ))}
  //       </CardBody>
  //     </Card>
  //     <Card>
  //       <CardHeader
  //         color="transparent"
  //         floated={false}
  //         shadow={false}
  //         className="m-0 p-4"
  //       >
  //         <Typography variant="h5" color="blue-gray">
  //           Alerts with Icon
  //         </Typography>
  //       </CardHeader>
  //       <CardBody className="flex flex-col gap-4 p-4">
  //         {alerts.map((color) => (
  //           <Alert
  //             key={color}
  //             open={showAlertsWithIcon[color]}
  //             color={color}
  //             icon={
  //               <InformationCircleIcon strokeWidth={2} className="h-6 w-6" />
  //             }
  //             onClose={() => setShowAlertsWithIcon((current) => ({
  //               ...current,
  //               [color]: false,
  //             }))}
  //           >
  //             A simple {color} alert with an <a href="#">example link</a>. Give
  //             it a click if you like.
  //           </Alert>
  //         ))}
  //       </CardBody>
  //     </Card>
  //   </div>
    );
}

export default Trip;
