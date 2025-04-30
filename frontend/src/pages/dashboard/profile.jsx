import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
  IconButton,
  Input,
} from "@material-tailwind/react";
import {
  PencilIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { logout, updateUser, getProfile, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from "@/util/api";
import { useMaterialTailwindController } from "@/context";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useMaterialTailwindController();
  const [openUserEditModal, setOpenUserEditModal] = useState(false);
  const [userEditError, setUserEditError] = useState("");
  const [editUser, setEditUser] = useState({});
  const [friendEmail, setFriendEmail] = useState("");
  const [showPasswords, setShowPasswords] = useState([false, false, false]);

  const fetchUser = async () => {
    const { data } = await getProfile();
    setUser(data.user);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const toggleShowPassword = (idx) => {
    setShowPasswords(prev => {
      const newArray = [...prev];
      newArray[idx] = !newArray[idx];
      return newArray;
    });
  }

  const openModalForUserEdit = () => {
    setEditUser({});
    setUserEditError("");
    setOpenUserEditModal(true);
  }

  const handleUserEditChange = (e) => {
      const { name, value } = e.target;
      setEditUser(prev => ({...prev, [name]: value}));
  }

  const handleUpdateUser = async () => {
    if (!editUser.username && !editUser.email && !(editUser.password && editUser.originalPassword)) {
      setUserEditError("No details set");
      return;
    }

    if (editUser.username && editUser.username.length < 3) {
      setUserEditError("Username must be atleast 3 characters long");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editUser.email && !emailPattern.test(editUser.email)) {
      setUserEditError("Please enter a valid email address.");
      return;
    }

    if (editUser.password) {
      if (editUser.password.length < 6) {
        setUserEditError("Password must be atleast 6 characters long");
        return;
      }

      if (editUser.password !== editUser.repeatPassword) {
        setUserEditError('Passwords are not matching');
        return;
      }
    }

    try {
      await updateUser(editUser);
      toast.success("Details updated");
      fetchUser();
      setOpenUserEditModal(false);
    } catch (e) {
      toast.error("Failed to update user details");
    }
  }

  const handleSendRequest = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!friendEmail || !emailPattern.test(friendEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      await sendFriendRequest(friendEmail);
      toast.success("Friend request sent!");
      setFriendEmail("");
      fetchUser();
    } catch {
      toast.error("Failed to send request.");
    }
  };

  const signout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/auth/sign-in');
    } catch {

    }
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover	bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-10">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <UserIcon
              className="rounded-lg shadow-lg bg-gray-300 p-4 w-16 h-16"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user.username}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {user.email}
                </Typography>
              </div>
              <IconButton variant="text" onClick={openModalForUserEdit}>
                <PencilIcon className="w-6 h-6   text-gray-600" />
              </IconButton>
            </div>
            <div className="w-50">
                <Button onClick={signout} className="hidden md:block">
                  <ArrowRightOnRectangleIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                  Sign out
                </Button>
                <IconButton onClick={signout} className="block md:hidden">
                  <ArrowRightOnRectangleIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                </IconButton>
            </div>
          </div>
          
          <Typography variant="h4" color="blue-gray" className="w-64 m-1">
            Send friend request
          </Typography>
          <div className="flex items-center gap-2 max-w-xl mb-6">
          <Input
            label="Friend's Email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            className="flex-1"
            containerProps={{ className: "min-w-0" }}
          />
          <Button onClick={handleSendRequest}>Send Request</Button>
          </div>
          <Typography variant="h4" color="blue-gray">Friends</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {user.friends.map((friend) => (
              <Card key={friend.userId} className="flex flex-row items-center p-4 gap-4 border border-gray-400 shadow-none">
                {<UserIcon className="w-6 h-6"/>}
                <div className="flex-1">
                  <Typography>{friend.username}</Typography>
                </div>
                <TrashIcon
                  className="w-5 h-5 cursor-pointer"
                  onClick={async () => { try {
                    await removeFriend(friend.userId);
                    toast.success("Friend removed!");
                    fetchUser();
                  } catch (e) {
                    toast.error("Failed to remove friend");
                  }
                  }}
                />
              </Card>
            ))}
          </div>
          {user.friends.length == 0 && (
            <div className="text-center w-full">
              <Typography variant="h6" color="red">You have not added any friends</Typography>
            </div>
          )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-4">
        <div>
          <Typography variant="h6" color="blue-gray" className="ml-2">Sent Requests</Typography>
          {user.sentFriendRequests.map((req) => (
            <Card className="p-4 space-y-3 shadow-none border border-gray-400">
              <div className="flex gap-2">{<UserIcon className="w-6 h-6"/>}<Typography key={req.userId}>{req.username}</Typography></div>
            </Card>
          ))}
          {user.sentFriendRequests.length == 0 && (
            <Card className="p-4 space-y-3 shadow-none">
              <Typography key={"no sent"}>No sent requests</Typography>
            </Card>
          )}
          </div>
          <div>

          <Typography variant="h6" color="blue-gray" className="ml-2">Pending Requests</Typography>
          {user?.pendingFriendRequests.map((req) => (
            <Card className="p-4 space-y-3 shadow-none border border-gray-400">
            <div
              key={req.userId}
              className="flex justify-between items-center"
              >
              <div className="flex gap-2">{<UserIcon className="w-6 h-6"/>}<Typography>{req.username}</Typography></div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => { try {
                    await acceptFriendRequest(req.userId);
                    toast.success("Friend accepted!");
                    fetchUser();
                  } catch (e) {
                    toast.error("Failed to accept friend request");
                  }
                  }}
                  >
                  Accept
                </Button>
                <Button
                  size="sm"
                  color="red"
                  onClick={async () => { try {
                    await declineFriendRequest(req.userId);
                    toast.success("Friend declined.");
                    fetchUser();
                  } catch (e) {
                    toast.error("Failed to decline friend request");
                  }
                  }}
                  >
                  Decline
                </Button>
              </div>
            </div>
        </Card>
          ))}
          {user.pendingFriendRequests.length == 0 && (
            <Card className="p-4 space-y-3 shadow-none">
              <Typography key={"no received"}>No pending requests</Typography>
            </Card>
          )}
        </div>
        </div>
        </CardBody>
        
      </Card>

      <Dialog open={openUserEditModal} handler={() => setOpenUserEditModal(false)} size="sm" className="p-8">
      <DialogHeader>Edit user Details</DialogHeader>
      <DialogBody className="space-y-4">
        <Input
          key={"username"}
          label={"Username"}
          name={"username"}
          value={editUser.username}
          type={"text"}
          onChange={handleUserEditChange}
        />
        <Input
          key={"email"}
          label={"Email"}
          name={"email"}
          value={editUser.email}
          type={"email"}
          onChange={handleUserEditChange}
        />
        <div className="mb-4 flex flex-col gap-6 relative">
          <Input
            label="Current Password"
            type={showPasswords[0] ? "text" : "password"}
            size="lg"
            name="originalPassword"
            value={editUser.originalPassword}
            onChange={handleUserEditChange}
            className="pr-12"
          />
          <IconButton
            variant="text"
            size="sm"
            aria-label="toggle password visibility"
            className="!absolute right-2 top-2 bg-white"
            onClick={() => toggleShowPassword(0)}
            >
              {showPasswords[0] ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600" />
              )}
          </IconButton>
        </div>
        <div className="mb-4 flex flex-col gap-6 relative">
          <Input
            label="Password"
            type={showPasswords[1] ? "text" : "password"}
            size="lg"
            name="password"
            value={editUser.password}
            onChange={handleUserEditChange}
            className="pr-12"
          />
          <IconButton
            variant="text"
            size="sm"
            aria-label="toggle password visibility"
            className="!absolute right-2 top-2 bg-white"
            onClick={() => toggleShowPassword(1)}
            >
              {showPasswords[1] ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600" />
              )}
          </IconButton>
        </div>
        <div className="mb-4 flex flex-col gap-6 relative">
          <Input
            label="Repeat Password"
            type={showPasswords[2] ? "text" : "password"}
            size="lg"
            name="repeatPassword"
            value={editUser.repeatPassword}
            onChange={handleUserEditChange}
            className="pr-12"
          />
          <IconButton
            variant="text"
            size="sm"
            aria-label="toggle password visibility"
            className="!absolute right-2 top-2 bg-white"
            onClick={() => toggleShowPassword(2)}
            >
              {showPasswords[2] ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600" />
              )}
          </IconButton>
        </div>
        {
          userEditError && (
            <Typography color="red" className="text-sm mt-2">
            {userEditError}
            </Typography>
          )
        }
      </DialogBody>
      <DialogFooter>
        <Button color="blue-gray" variant="text" onClick={() => setOpenUserEditModal(false)}>Cancel</Button>
        <Button color="blue" onClick={handleUpdateUser}>Save</Button>
      </DialogFooter>
    </Dialog>
    </>
  );
}

export default Profile;
