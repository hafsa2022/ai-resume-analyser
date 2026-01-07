import React from "react";
import { Link, Outlet } from "react-router";

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
        </Link>
      </nav>
      <div className="dashboard-layout min-h-screen bg-gray-50 p-4 md:p-8">
        <main className=" mt-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>

  );
};

export default DashboardLayout;
