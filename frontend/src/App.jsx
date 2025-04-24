import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Dashboard, Auth, NotFound, HomePage } from "@/layouts";
import { Footer, Navbar } from "./widgets/layout";
import routes from "./routes";
import { Toaster } from "react-hot-toast";

function App() {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen">
      {
        !(pathname.startsWith("/dashboard")) && 
        (
          <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
           <Navbar routes={routes[2].pages} />
          </div>
        )
      }
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<NotFound/>} />
      </Routes>
      {
        !(pathname.startsWith("/dashboard")) && <Footer />
      }
      
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            zIndex: 9999999,  
          },
        }}
      />
    </div>
  );
}

export default App;
