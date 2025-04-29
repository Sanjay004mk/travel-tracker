import React from "react";
import PropTypes from "prop-types";
import { Link as ScrollLink } from "react-scroll";
import { Link, useLocation, useNavigate }  from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useMaterialTailwindController } from "@/context";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  const { user } = useMaterialTailwindController();

  const { pathname } = useLocation();

  const homePage = useLocation().pathname == '/';
  const loginButtonText = user ? "Dashboard" : pathname.endsWith('sign-in') ? "Sign up" : "Login";

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(user ? '/dashboard' : pathname.endsWith('sign-in') ? '/auth/sign-up' : '/auth/sign-in');
  }

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </a>
          ) : (
            homePage ? <ScrollLink
              to={path}
              smooth={true}
              duration={500}
              className="flex items-center gap-1 px-4 py-2 font-bold cursor-pointer rounded-lg hover:bg-gray-200 transition"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </ScrollLink> : <Link
              to={"/"}
              smooth={true}
              duration={500}
              className="flex items-center gap-1 px-4 py-2 font-bold cursor-pointer rounded-lg hover:bg-gray-200 transition"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar color="transparent" className="p-3 text-blue-gray ">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <Typography className="mr-4 ml-2 cursor-pointer py-1.5 font-bold">
            {brandName}
          </Typography>
        </Link>
        <div className="hidden lg:block">{navList}</div>
        <div className="hidden gap-2 lg:flex">
          <Button variant="gradient" size="sm" onClick={handleLogin} fullWidth >
            {loginButtonText}
          </Button>
        </div>
        <IconButton
          variant="text"
          size="sm"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      <MobileNav
        className="rounded-xl bg-white px-4 pt-2 pb-4 text-blue-gray-900"
        open={openNav}
      >
        <div className="container mx-auto">
          {navList}
            <Button variant="gradient" size="sm" onClick={() => {setOpenNav(false); handleLogin();}} fullWidth >
              {loginButtonText}
            </Button>
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "Path Finder",
  action: (
    <a
      href="https://www.creative-tim.com/product/material-tailwind-kit-react"
      target="_blank"
    >
      <Button variant="gradient" size="sm" fullWidth>
        free download
      </Button>
    </a>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
