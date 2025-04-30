import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Input,
  Textarea,
  Checkbox,
} from "@material-tailwind/react";
import { FingerPrintIcon, UsersIcon } from "@heroicons/react/24/solid";
import { PageTitle } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData } from "@/data";

export function HomePage() {
  return (
    <>
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-4">
          <section className="-mt-32 bg-white px-4 pb-20 pt-4" id="home">
            
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              <Typography
                variant="h1"
                className="mb-6 font-black"
                >
                Track Your Journeys Seamlessly.
              </Typography>
              <Typography variant="lead" className="opacity-80">
              Your personal companion for logging and visualizing your travels. Whether you're a globetrotter or planning your first trip, our application helps you keep track of the places you've visited and the memories you've made.
              </Typography>
            </div>
          </div>
        </section>
      </div>
      <section className="-mt-32 bg-white px-4 pb-20 pt-4" id="features">
      <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ color, title, icon, description }) => (
              <FeatureCard
                key={title}
                color={color}
                title={title}
                icon={React.createElement(icon, {
                  className: "w-5 h-5 text-white",
                })}
                description={description}
              />
            ))}
          </div>
          <div className="mt-32 flex flex-wrap items-center" id="about">
            <div className="mx-auto -mt-8 w-full px-4 md:w-5/12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-gray-900 p-2 text-center shadow-lg">
                <FingerPrintIcon className="h-8 w-8 text-white " />
              </div>
              <Typography
                variant="h3"
                className="mb-3 font-bold"
                color="blue-gray"
              >
                Tech Stack
              </Typography>
              <Typography className="mb-8 font-normal text-blue-gray-500">
              <strong>Frontend</strong>: React.js, HTML5, Tailwind<br/>

              <strong>Backend</strong>: Node.js, Express.js<br/>

              <strong>Database</strong>: MongoDB<br/>

              <strong>Authentication</strong>: JWT (JSON Web Tokens)<br/>

              <strong>Deployment</strong>: Vercel (frontend), Render (backend)<br/>
              </Typography>
            </div>
            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardBody>
                <img
                    alt="Card Image"
                    src="/img/tech.png"
                    className="h-full w-full"
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
          </>
  );
}

export default HomePage;
