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
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  StarIcon as StarIconOutline
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { StatisticsCard, TripCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { ArrowLeftIcon, ArrowRightCircleIcon, CheckCircleIcon, ClockIcon, CubeTransparentIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import Button from "@material-tailwind/react";
import { JoinTrip } from "@/pages/dashboard/join-trip";
import { StartTrip } from "@/pages/dashboard/start-trip";
import { getTrips, setFavorite } from "@/util/api";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [showTripForm, setShowTripForm] = useState(0);

  const [trips, setTrips] = useState([]);

  const enableTripForm = (formNumber) => {
    setShowTripForm(prev => formNumber);
  }

  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const { data } = await getTrips();
      setTrips(data.trips);
      
    } catch (error) {
      console.log(error);
      ;
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
        showTripForm == 0 && (
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

      <div onClick={() => enableTripForm(1)}>
        <TripCard
          title="Join trip"
          color="white"
          value="Join"
          icon={
            <ArrowRightCircleIcon className="w-12 h-12 text-gray-950"/>
          }
          footer={
            <Typography className="font-normal text-sm text-blue-gray-600">
              Join an existing trip.
            </Typography>
          }
        />
      </div>
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
      {/* <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Projects
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>30 done</strong> this month
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["companies", "members", "budget", "completion"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(
                  ({ img, name, members, budget, completion }, key) => {
                    const className = `py-3 px-5 ${
                      key === projectsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={img} alt={name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          {members.map(({ img, name }, key) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                alt={name}
                                size="xs"
                                variant="circular"
                                className={`cursor-pointer border-2 border-white ${
                                  key === 0 ? "" : "-ml-2.5"
                                }`}
                              />
                            </Tooltip>
                          ))}
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {budget}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600"
                            >
                              {completion}%
                            </Typography>
                            <Progress
                              value={completion}
                              variant="gradient"
                              color={completion === 100 ? "green" : "blue"}
                              className="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Orders Overview
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>24%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div key={title} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === ordersOverviewData.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
                    }`}
                  >
                    {React.createElement(icon, {
                      className: `!w-5 !h-5 ${color}`,
                    })}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      {title}
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {description}
                    </Typography>
                  </div>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div> */}
    </div>
  );
}

export default Home;
