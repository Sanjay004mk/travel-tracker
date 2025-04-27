import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Button,
  Input
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  StarIcon as StarIconOutline
} from "@heroicons/react/24/outline";
import { StatisticsCard, TripCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { StarIcon as StarIconSolid, ArrowLeftIcon, ArrowRightCircleIcon, CheckCircleIcon, ClockIcon, CubeTransparentIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { JoinTrip } from "@/pages/dashboard/joinTrip";
import { StartTrip } from "@/pages/dashboard/startTrip";
import { getTrips, setFavorite, joinTrip, leaveTrip } from "@/util/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function Home() {
  const [showTripForm, setShowTripForm] = useState(0);

  const [trips, setTrips] = useState([]);
  const [sharedTrips, setSharedTrips] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [reqTripCode, setReqTripCode] = useState("");

  const enableTripForm = (formNumber) => {
    setShowTripForm(prev => formNumber);
  }

  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const { data } = await getTrips();
      setTrips(data.trips);
      setSharedTrips(data.shared); 
      setSentRequests(data.joinRequests); 
    } catch (error) {
      toast.error(error);
    }
  }

  const setTripFavorite = async (tripCode, value) => {
    await setFavorite(tripCode, value);
    fetchTrips();
  }

  useEffect(() => {
    fetchTrips();    
  }, [])

  return (
    <div className="mt-4 min-h-screen">
      {
        showTripForm == 0 && (<div><Typography variant="h4" className="mb-2 ml-2">My Trips</Typography>
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {
          trips.map((trip, index) => (
            <div key={index} onClick={() => navigate('/dashboard/trip/' + trip.tripCode)}>
            <TripCard
              title={trip.location}
              color="white"
              value={trip.name}
              icon={
                <div onClick={(event) => {
                  event.stopPropagation();
                  setTripFavorite(trip.tripCode, !trip.favorited)
                }}>
                  {
                    (trip.favorited ?
                      <StarIconSolid className="w-12 h-12" color="blue-gray"/>
                      : <StarIconOutline className="w-12 h-12" color="blue-gray"/>)
                    }
                </div>
              }
              footer={
                <Typography className="font-normal text-sm text-blue-gray-600">
                  {trip.startDate} - {trip.endDate}
                </Typography>
              }
            />
          </div>
          ))
        }

      <div onClick={() => enableTripForm(2)}>
      <TripCard
        title="New trip"
        color="white"
        value="Start"
        icon={
          <PlusCircleIcon className="w-12 h-12 text-gray-950"/>
        }
        footer={
          <Typography className="font-normal text-sm text-blue-gray-600">
            Start a new trip.
          </Typography>
        }
        />
      </div>
      </div>
      </div>
      )}
      <div className="flex flex-col md:flex-row items-start gap-4">
      {
        showTripForm != 0 && (
          <IconButton size="sm" variant="text" color="blue-gray" onClick={() => setShowTripForm(0)}>
                  <ArrowLeftIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                    />
                </IconButton>
        )  
      }
      {
        (showTripForm == 1) && <JoinTrip />
      }
      {
        (showTripForm == 2) && <StartTrip />
      }
      </div>
      <hr/>
      
      <div>
      {sharedTrips.length != 0 && <Typography variant="h4" className="mb-2 ml-2">Received requests</Typography>}
      <div className="mb-4 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {sharedTrips.map(trip => (
          <Card>
            <CardBody>
            <Typography variant="text" color="blue-gray">{trip.name}</Typography>
            <div className="flex gap-x-2 mt-4">
              <Button size="sm" onClick={async () => {
                try {
                  await joinTrip({ tripCode: trip.tripCode });
                  toast.success("Joined trip");
                  fetchTrips();
                } catch (e) {
                  toast.error("Failed to accept request");
                }
              }}>Accept</Button>
              <Button size="sm" color="red" onClick={async () => {
                try {
                  await leaveTrip(trip.tripCode);
                  fetchTrips();
                } catch (e) {
                  toast.error("Failed to decline request");
                }
              }}>Decline</Button>
            </div>
          </CardBody>
          </Card>
        ))}
      </div>
      </div>
        <Typography variant="h4" className="mb-2 ml-2">Join trip</Typography>
        <Card className="max-w-60 mb-4">
          <CardBody className="max-w-60">
          <div className="flex flex-col items-start gap-2 max-w-xl mb-6">
          <Input
            label="Trip code"
            value={reqTripCode}
            onChange={(e) => setReqTripCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={async () => {
            if (!reqTripCode.trim().length === 0) 
              return;
            try {
              await joinTrip({ tripCode: reqTripCode });
              toast.success("Sent request");
              setReqTripCode("");
              fetchTrips();
            } catch (e) {
              console.log(e);
              toast.error("Failed to send request");
            }
          }}>Send Request</Button>
          </div>

          </CardBody>
        </Card>
        
      <div>
      {sentRequests.length != 0 && <Typography variant="h4" className="mb-2 ml-2">Sent requests</Typography>}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {sentRequests.map(trip => (
          <Card>
            <CardBody>
            <Typography variant="text" color="blue-gray">{trip.name}</Typography>
            <div className="flex gap-x-2 mt-4">
              <Button size="sm" color="red" onClick={async () => {
                try {
                  await leaveTrip(trip.tripCode);
                  fetchTrips();
                } catch (e) {
                  toast.error("Failed to decline request");
                }
              }}>Remove</Button>
            </div>
          </CardBody>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Home;
