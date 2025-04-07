import { Routes, Route, useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useEffect } from "react";
import { NotFound } from ".";
import { Navigate } from "react-router-dom";
import { getProfile } from "@/util/api";

export function Dashboard() {
  const { controller, dispatch, user, setUser } = useMaterialTailwindController();
  const { sidenavType } = controller;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getProfile();
        setUser(data.user);
      } catch {
        navigate("/auth/sign-in");
      }
    }
    if (!user) {
      fetchUser();
    }
  }, [user, setUser]);

  return user && (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={[routes[0]]}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
        brandName='PathFinder'
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Routes>
          <Route exact path="/" element={<Navigate to="/dashboard/home" replace />} />
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
