import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import AddMoneyModal from "./AddMoneyModal"; // Ensure the path is correct

export const Appbar = ({ onBalanceUpdate, firstName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleAddMoney = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = (newBalance) => {
    if (onBalanceUpdate) {
      onBalanceUpdate(newBalance);
    }
    setIsModalOpen(false);
  };

  return (
    <header className="bg-slate-200 shadow h-16 px-4 flex justify-between items-center">
      {/* App Title */}
      <div
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Transactions & Wallet App
      </div>

      {/* Right Section: Add Money Button and User Account */}
      <div className="flex items-center gap-4 relative">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleAddMoney}
        >
          Add Money
        </button>

        <div className="flex items-center gap-2">
          <div className="font-semibold cursor-pointer" onClick={toggleDropdown}>
            {firstName ? `${firstName}'s Account` : "User Account"}
          </div>
          <div className="rounded-full h-10 w-10 bg-slate-200 flex items-center justify-center text-lg font-medium">
            {firstName ? firstName.charAt(0) : "U"}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
            <ul className="py-2">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleProfile}
              >
                Profile & Txn History
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleDashboard}
              >
                Dashboard
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {isModalOpen && (
        <AddMoneyModal onClose={closeModal} onSuccess={handleModalSuccess} />
      )}
    </header>
  );
};
