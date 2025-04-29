import {
  getMetricsAllTripTotalExpense,
  getMetricsAllTripDuration,
  getMetricsAllTripExpenseSplit,
} from "@/util/api";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Select,
  Option,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function Compare() {
  const [expensesPerTrip, setExpensesPerTrip] = useState([]);
  const [tripDurations, setTripDurations] = useState([]);
  const [allTripsSplit, setAllTripsSplit] = useState({});
  const [splitSelectedTrip, setSplitSelectedTrip] = useState("");

  const fetchExpensesPerTrip = async () => {
    try {
      const { data } = await getMetricsAllTripTotalExpense();
      setExpensesPerTrip(data.tripExpenses);
    } catch (e) {
      toast.error("Failed to fetch trip expenses");
    }
  };

  const fetchDurationPerTrip = async () => {
    try {
      const { data } = await getMetricsAllTripDuration();
      setTripDurations(data.trips);
    } catch (e) {
      toast.error("Failed to fetch trip durations");
    }
  };

  const fetchAllTripsSplit = async () => {
    try {
      const { data } = await getMetricsAllTripExpenseSplit();
      setAllTripsSplit(data.splits);
      setSplitSelectedTrip(Object.keys(data.splits)[0]);
    } catch (e) {
      toast.error("Failed to fetch expense split up");
    }
  };

  const tripSplitData = [
    { name: "You", value: 7000 },
    { name: "Alice", value: 5000 },
    { name: "Bob", value: 3000 },
  ];

  const netBalances = [
    { friend: "Alice", amount: 2000 },
    { friend: "Bob", amount: -1500 },
    { friend: "Charlie", amount: 0 },
  ];

  const tripsWithFriends = [
    { friend: "Alice", trips: 3 },
    { friend: "Bob", trips: 2 },
    { friend: "Charlie", trips: 1 },
  ];

  const mostExpensiveUsers = [
    { user: "You", total: 20000 },
    { user: "Alice", total: 15000 },
    { user: "Bob", total: 10000 },
  ];

  const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#facc15"];

  useEffect(() => {
    fetchExpensesPerTrip();
    fetchDurationPerTrip();
    fetchAllTripsSplit();
  }, []);

  return (
    <div className="mb-8 mt-12 flex flex-col gap-12">
      {/* 2 Columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Total Expenses per Trip */}
        <Card>
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h5" color="blue-gray">
              Total Expenses per Trip
            </Typography>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expensesPerTrip}>
                <XAxis dataKey="tripName" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="totalAmount"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h5" color="blue-gray">
              Trip Durations
            </Typography>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tripDurations}>
                <XAxis dataKey="tripName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h5" color="blue-gray">
              Expense Split
            </Typography>
          </CardHeader>
          <CardBody>
            {allTripsSplit && splitSelectedTrip && (
              <Select
                label="Trip"
                value={splitSelectedTrip || "None"}
                onChange={(value) => setSplitSelectedTrip(value)}
              >
                {Object.entries(allTripsSplit).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value.tripName}
                  </Option>
                ))}
              </Select>
            )}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={allTripsSplit[splitSelectedTrip]?.expenseSplit || null}
                  dataKey="amount"
                  nameKey="username"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#3b82f6"
                  label
                >
                  {tripSplitData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Trips Shared with Friends */}
        <Card>
          <CardHeader floated={false} shadow={false}>
            <Typography variant="h5">Trips Shared with Friends</Typography>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tripsWithFriends}>
                <XAxis dataKey="friend" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Net Balances Table */}
      <Card>
        <CardHeader floated={false} shadow={false}>
          <Typography variant="h5">Net Balances with Friends</Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b p-3">Friend</th>
                <th className="border-b p-3">Amount (₹)</th>
                <th className="border-b p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {netBalances.map(({ friend, amount }, idx) => (
                <tr key={idx}>
                  <td className="border-b p-3">{friend}</td>
                  <td className="border-b p-3">{amount}</td>
                  <td className="border-b p-3">
                    <Chip
                      size="sm"
                      color={amount > 0 ? "green" : amount < 0 ? "red" : "blue"}
                      value={
                        amount > 0
                          ? "They owe you"
                          : amount < 0
                          ? "You owe"
                          : "Settled"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Top Spenders */}
      <Card>
        <CardHeader floated={false} shadow={false}>
          <Typography variant="h5">Top Spenders</Typography>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mostExpensiveUsers}>
              <XAxis dataKey="user" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}

export default Compare;
