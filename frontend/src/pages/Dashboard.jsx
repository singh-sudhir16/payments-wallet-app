import { useState, useEffect } from "react";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import axios from "axios";

export const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [profile, setProfile] = useState({ firstName: "" });

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://payments-wallet-app.onrender.com/api/v1/account/balance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalance(res.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://payments-wallet-app.onrender.com/api/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Fetch balance and profile on mount
  useEffect(() => {
    fetchBalance();
    fetchProfile();
  }, []);

  const handleBalanceUpdate = (newBalance) => {
    setBalance(newBalance);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Appbar onBalanceUpdate={handleBalanceUpdate} firstName={profile.firstName} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {balance !== null ? (
          <Balance value={balance} />
        ) : (
          <p>Loading balance...</p>
        )}
        <section>
          <Users />
        </section>
      </main>
    </div>
  );
};
