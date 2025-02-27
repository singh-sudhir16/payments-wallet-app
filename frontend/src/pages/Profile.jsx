import { useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  // Profile state (personal info)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState(null);
  // Transaction history state
  const [transactionHistory, setTransactionHistory] = useState([]);
  // Loading and editing states
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleBalanceUpdate = (newBalance) => {
    setWalletBalance(newBalance);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchProfile = axios.get("https://payments-wallet-app.onrender.com/api/v1/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchBalance = axios.get("https://payments-wallet-app.onrender.com/api/v1/account/balance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchTransactions = axios
      .get("https://payments-wallet-app.onrender.com/api/v1/account/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(() => ({ data: { transactions: [] } }));

    Promise.all([fetchProfile, fetchBalance, fetchTransactions])
      .then(([profileRes, balanceRes, txRes]) => {
        setProfile(profileRes.data.profile);
        setWalletBalance(balanceRes.data.balance);
        setTransactionHistory(txRes.data.transactions || []);
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
        toast.error("Error fetching profile data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("https://payments-wallet-app.onrender.com/api/v1/user", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const data = JSON.stringify(passwordData);
      await axios.put(
        "https://payments-wallet-app.onrender.com/api/v1/user/change-password",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Pass the user's firstName to Appbar */}
      <Appbar onBalanceUpdate={handleBalanceUpdate} firstName={profile.firstName} />
      <div className="w-full mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Personal Information Section */}
        <h2 className="text-2xl font-bold mb-4">My Profile</h2>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                {profile.firstName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Account Information</h3>
        <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">Wallet Balance:</div>
            <div className="text-2xl font-bold text-green-600">
            Rs {Number(walletBalance).toFixed(2)}
            </div>
        </div>
        </div>


        {/* Change Password Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Change Password</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handlePasswordUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">Transaction History</h3>
          {transactionHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionHistory.map((tx) => (
                    <tr key={tx._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.transactionType === 'debit' ? 'Debit' : 'Credit'} - {tx.counterparty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.transactionType === 'debit'
                          ? `-Rs ${tx.amount}`
                          : `+Rs ${tx.amount}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
