import { Bell } from "lucide-react"
import { assets } from "../../../assets/assets"


const UserActions = () => {
  return (
<div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <img
            src={assets.profile_img}
            alt="Profile"
            className="w-8 h-8 rounded-full border"
          />
        </div>
  )
}

export default UserActions
