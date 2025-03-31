import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, NotFound, HomePage } from "@/layouts";

function App() {
  return (

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
}

export default App;
