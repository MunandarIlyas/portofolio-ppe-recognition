import { useState, type FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

import Home from "@/pages/About";
import History from "./pages/History";
import About from "@/pages/About";
import Setting from "./pages/Setting";
import PPE from "@/pages/Ppe-Detection";

const App: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1">
          <Sidebar sidebarOpen={sidebarOpen} />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/ppe-detection" element={<PPE />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
