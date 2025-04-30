import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Collapse,
  Button,
  Alert,
} from "@material-tailwind/react";
import axios from "axios";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController } from "@/context";
import { getAllExpense } from "@/util/api";

export function Expenses() {
  const { user } = useMaterialTailwindController();
  const [expenses, setExpenses] = useState([]);
  const [expandedTrips, setExpandedTrips] = useState({});
  const [oweExpanded, setOweExpanded] = useState({});
  const [owedExpanded, setOwedExpanded] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const calcOwings = (expenses) => {};

  const fetchExpenses = async () => {
    try {
      const res = await getAllExpense();
      setExpenses(res.data.expenses);
    } catch (err) {
      setError("Failed to fetch expenses.");
      console.error(err);
    }
  };

  const tripWiseExpenses = expenses.reduce((acc, exp) => {
    const tripId = exp.trip._id || "Unknown Trip";
    if (!acc[tripId]) {
      acc[tripId] = {
        name: exp.trip.name || "Unnamed Trip",
        total: 0,
        expenses: [],
      };
    }
    const userExpense = exp.amount / (exp.splitBetween.length || 1);
    acc[tripId].total += userExpense;
    acc[tripId].expenses.push({ ...exp, userExpense });
    return acc;
  }, {});

  const oweData = {};
  const owedData = {};

  expenses.forEach((exp) => {
    const splitAmount = exp.amount / (exp.splitBetween.length || 1);

    exp.splitBetween.forEach((member) => {
      if (member._id === user._id) {
        if (exp.paidBy._id !== user._id) {
          if (!oweData[exp.paidBy._id]) {
            oweData[exp.paidBy._id] = {
              username: exp.paidBy.username,
              total: 0,
              expenses: [],
            };
          }
          oweData[exp.paidBy._id].total += splitAmount;
          oweData[exp.paidBy._id].expenses.push(exp);
        }
      } else if (exp.paidBy._id === user._id) {
        if (!owedData[member._id]) {
          owedData[member._id] = {
            username: member.username,
            total: 0,
            expenses: [],
          };
        }
        owedData[member._id].total += splitAmount;
        owedData[member._id].expenses.push(exp);
      }
    });
  });

  Object.keys(oweData).forEach((personId) => {
    if (owedData[personId]) {
      const owedAmount = owedData[personId].total;
      const oweAmount = oweData[personId].total;
      const diff = oweAmount - owedAmount;

      if (diff > 0) {
        oweData[personId].total = diff;
        const owedExpenses = owedData[personId].expenses.map(exp => ({...exp, amount: -exp.amount}));
        oweData[personId].expenses = [...oweData[personId].expenses, ...owedExpenses];
        delete owedData[personId];
      } else if (diff < 0) {
        owedData[personId].total = -diff;
        const oweExpenses = oweData[personId].expenses.map(exp => ({...exp, amount: -exp.amount}));
        owedData[personId].expenses = [...owedData[personId].expenses, ...oweExpenses];
        console.log(owedData[personId]);
        delete oweData[personId];
      } else {
        delete oweData[personId];
        delete owedData[personId];
      }
    }
  });

  const toggleTrip = (id) => {
    setExpandedTrips((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOwe = (id) => {
    setOweExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOwed = (id) => {
    setOwedExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalExpenditure = Object.values(tripWiseExpenses).reduce(
    (sum, trip) => sum + trip.total,
    0,
  );

  return (
    <div className="space-y-6 p-6">
      <Typography variant="h4">Your Expenses</Typography>

      {error && <Alert color="red">{error}</Alert>}

      <Card>
        <CardHeader
          floated={false}
          className="flex justify-between shadow-none"
        >
          <Typography variant="h5" color="blue-gray">
            Total Expenditure
          </Typography>
          <Typography
            variant="h5"
            color={"red"}
          >
            ₹ {Math.abs(totalExpenditure).toFixed(2)}
          </Typography>
        </CardHeader>
        <CardBody className="space-y-2">
          {Object.entries(tripWiseExpenses).map(([id, trip], objIdx) => (
            <div key={id} className="border-b pb-2">
              <div
                className={"flex cursor-pointer items-center justify-between p-2 "}
                onClick={() => toggleTrip(id)}
              >
                <div className="flex items-center space-x-2">
                  <PlayIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedTrips[id] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                  <Typography color="blue-gray">{trip.name}</Typography>
                </div>
                <Typography variant="small" className="font-bold" color={"red"}>
                  ₹ {Math.abs(trip.total).toFixed(2)}
                </Typography>
              </div>

              <Collapse open={expandedTrips[id]}>
                {trip.expenses.map((e, idx) => (
                  <div
                    key={idx}
                    className={"ml-4 flex justify-between py-1 text-sm p-2 " + ((idx % 2 == 0) ? "bg-gray-300" : "bg-gray-100")}
                  >
                    <span className="text-gray-900">{e.description}</span>
                    <span className={"text-red-700"}>₹ {Math.abs(e.userExpense).toFixed(2)}</span>
                  </div>
                ))}
              </Collapse>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader floated={false} className="shadow-none">
          <Typography variant="h5" color="blue-gray">You Owe</Typography>
        </CardHeader>
        <CardBody className="space-y-2">
          {Object.entries(oweData).length === 0 && (
            <Typography>All accounts settled</Typography>
          )}
          {Object.entries(oweData).map(([id, person]) => (
            <div key={id} className="border-b pb-2">
              <div
                className="flex cursor-pointer items-center justify-between py-2"
                onClick={() => toggleOwe(id)}
              >
                <div className="flex items-center space-x-2">
                  <PlayIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      oweExpanded[id] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                  <Typography>{person.username}</Typography>
                </div>
                <Typography variant="small" color="red" className="font-bold">
                  ₹ {person.total.toFixed(2)}
                </Typography>
              </div>

              <Collapse open={oweExpanded[id]}>
                {person.expenses.map((e, idx) => (
                  <div
                    key={idx}
                    className={ "ml-4 flex justify-between p-2 text-sm " + ((idx % 2 == 0) ? "bg-gray-300" : "bg-gray-100") }
                  >
                    <span className="text-gray-900">{e.description}</span>
                    <span className={e.amount > 0 ? "text-red-700" : "text-green-700"}>
                      ₹ {(Math.abs(e.amount) / (e.splitBetween.length || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </Collapse>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader floated={false} className="shadow-none">
          <Typography variant="h5" color="blue-gray">You Are Owed</Typography>
        </CardHeader>
        <CardBody className="space-y-2">
          {Object.entries(owedData).length === 0 && (
            <Typography>All accounts settled</Typography>
          )}
          {Object.entries(owedData).map(([id, person]) => (
            <div key={id} className="border-b pb-2">
              <div
                className="flex cursor-pointer items-center justify-between py-2"
                onClick={() => toggleOwed(id)}
              >
                <div className="flex items-center space-x-2">
                  <PlayIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      owedExpanded[id] ? "rotate-90" : "rotate-0"
                    }`}
                  />
                  <Typography>{person.username}</Typography>
                </div>
                <Typography variant="small" color="green" className="font-bold">
                  ₹ {person.total.toFixed(2)}
                </Typography>
              </div>

              <Collapse open={owedExpanded[id]}>
                {person.expenses.map((e, idx) => (
                  <div
                    key={idx}
                    className={ "ml-4 flex justify-between p-2 text-sm " + ((idx % 2 == 0) ? "bg-gray-300" : "bg-gray-100")}
                  >
                    <span className="text-gray-900">{e.description}</span>
                    <span className={e.amount > 0 ?  "text-green-700": "text-red-700"}>
                      ₹ {(Math.abs(e.amount) / (e.splitBetween.length || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </Collapse>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default Expenses;
