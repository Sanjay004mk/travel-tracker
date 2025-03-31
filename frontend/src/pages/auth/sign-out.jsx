import { useMaterialTailwindController } from "@/context";
import { logout } from "@/util/api";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


export function SignOut() {

  const { setUser } = useMaterialTailwindController();

  const navigate = useNavigate();

  useEffect(() => {
    logout();
    setUser(null);
    navigate('/auth/sign-in');
    
  });

  return (
    <section className="m-8 flex">
            <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">You have been signed out</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">You should be redirected to the sign in page. If not, click below</Typography>
        </div>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            <Link to="/auth/sign-in" className="text-gray-900 ml-1">Go to sign in page</Link>
          </Typography>

      </div>
    </section>
  );
}

export default SignOut;
