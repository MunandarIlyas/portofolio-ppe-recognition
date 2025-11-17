import { FC } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-xl font-semibold text-gray-700">My App</h1>
      </div>
    </header>
  );
};

export default Header;
