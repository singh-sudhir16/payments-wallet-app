import { useSearchParams } from 'react-router-dom';
import axios from "axios";
import { useState } from 'react';

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [amount, setAmount] = useState(0);
  const [transferStatus, setTransferStatus] = useState("");

  const handleTransfer = async () => {
    try {
      await axios.post(
        "https://payments-wallet-app.onrender.com/api/v1/account/transfer",
        { to: id, amount },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      // On success, update the status message
      setTransferStatus("Transfer is successful!");
    } catch (error) {
      // On error, update the status message accordingly
      setTransferStatus("Transfer failed. Please try again.");
      console.error("Transfer error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-stone-200 pt-[80px] flex justify-center">
      <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col space-y-1.5 p-6">
          <h2 className="text-3xl font-bold text-center">Send Money</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-2xl text-white">{name[0].toUpperCase()}</span>
            </div>
            <h3 className="text-2xl font-semibold">{name}</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="amount">
                Amount (in Rs)
              </label>
              <input
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                id="amount"
                placeholder="Enter amount"
              />
            </div>
            <button
              onClick={handleTransfer}
              className="justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Initiate Transfer
            </button>
            {/* Display the transfer status message on screen */}
            {transferStatus && (
              <div className="mt-4">
                <p className="text-center text-green-600">{transferStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
