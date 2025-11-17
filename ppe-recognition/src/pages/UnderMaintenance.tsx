import React from "react";
import { Hammer, AlertCircle } from "lucide-react";

const UnderMaintenance: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Icon */}
      <div className="bg-yellow-200 rounded-full p-6 mb-6 animate-pulse">
        <Hammer className="w-16 h-16 text-yellow-600" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        🚧 Under Maintenance
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md mb-6">
        Our website is currently undergoing scheduled maintenance. We apologize
        for any inconvenience and appreciate your patience. Please check back
        soon!
      </p>

      {/* Optional Alert */}
      <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <span className="text-yellow-800 text-sm">
          Maintenance may take a few minutes.
        </span>
      </div>
    </div>
  );
};

export default UnderMaintenance;
