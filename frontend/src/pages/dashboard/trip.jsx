import React, { useEffect, useState } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  List,
  ListItem,
  Chip,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { useParams } from "react-router-dom";
import { getTripDetails } from "@/util/api";

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

  useEffect(() => {
    const getDetails = async () => {
      try {
        const { data } = await getTripDetails(id);
        console.log(data.trip);
        setTripDetails(data.trip);
      } catch {
        setTripDetails({});
      }
    }
    getDetails();
  }, [])

  if (!tripDetails || !tripDetails.name) {
    return (
      <Typography variant="h5" className="text-center mt-64 min-h-screen">
        Loading trip details...
      </Typography>
    );
  }

  return (
    <>
      <div className="min-h-screen mt-4">
      <Card className="max-w-4xl mx-auto mt-10 p-6 space-y-6 shadow-lg">
      <div className="flex justify-between items-center">
        <Typography variant="h4">{tripDetails.name}</Typography>
        <Chip
          value={tripDetails.endDate ? "Completed" : "Ongoing"}
          color={tripDetails.endDate ? "green" : "blue"}
        />
      </div>

      <div className="space-y-2">
        <Typography color="blue-gray">
          <strong>Location:</strong> {tripDetails.location}
        </Typography>

        <Typography color="blue-gray">
          <strong>Start:</strong> {tripDetails.startDate}
        </Typography>

        <Typography color="blue-gray">
          <strong>End:</strong> {tripDetails.endDate ? tripDetails.endDate : "On going"}
        </Typography>
        
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
