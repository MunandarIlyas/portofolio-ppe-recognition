import React, { type FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="bg-white shadow-inner p-4 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} My Dashboard — Built with React + Vite + Tailwind 💙
    </footer>
  );
};

export default Footer;
