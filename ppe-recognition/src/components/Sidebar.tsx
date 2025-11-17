import type { FC } from "react";
import { Home, User, Settings, Focus, FileClock } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ sidebarOpen }) => {
  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } bg-white shadow-md overflow-hidden transition-all duration-300`}
    >
      <nav className="flex flex-col p-4 space-y-3">
        <Link
          to="/"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <Home size={20} className="text-blue-600" />
          <span>Home</span>
        </Link>

        <Link
          to="/ppe-detection"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <Focus size={20} className="text-blue-600" />
          <span>PPE Detection</span>
        </Link>

        <Link
          to="/history"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <FileClock size={20} className="text-blue-600" />
          <span>History</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <User size={20} className="text-blue-600" />
          <span>About</span>
        </Link>

        <Link
          to="/setting"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-gray-700"
        >
          <Settings size={20} className="text-blue-600" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
