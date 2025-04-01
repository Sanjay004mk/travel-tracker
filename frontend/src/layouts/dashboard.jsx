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
      const profile = await getProfile();
      console.log(profile);
      if (!profile) {
        console.log('leaving');
        navigate("/auth/sign-in");
      }
      setUser(profile);
    }
    if (!user) {
      console.log('checking');
      fetchUser();
    }
  }, [setUser]);

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
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
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
