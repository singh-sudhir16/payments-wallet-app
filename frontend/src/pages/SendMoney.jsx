import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name") || "Recipient";
  const [amount, setAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      setTransferStatus("Please enter a valid amount.");
      return;
    }

    try {
      setIsLoading(true);
      setTransferStatus("");

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center">Send Money</h1>

        {/* Recipient Info */}
        <div className="flex items-center justify-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-2xl text-white font-semibold uppercase">
              {name[0]}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">Confirm recipient details</p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="amount"
          >
            Amount (in Rs)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full h-10 px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={isLoading}
          className={`w-full h-10 rounded-md text-white font-medium flex items-center justify-center transition-colors ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                />
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            "Initiate Transfer"
          )}
        </button>

        {/* Status Message */}
        {transferStatus && (
          <div className="mt-2 text-center">
            {transferStatus.includes("successful") ? (
              <p className="text-green-600 font-semibold">{transferStatus}</p>
            ) : (
              <p className="text-red-600 font-semibold">{transferStatus}</p>
            )}
          </div>
        )}

        {/* Back to Dashboard Link (optional) */}
        <div className="text-center pt-4">
          <Link
            to="/dashboard"
            className="text-indigo-500 hover:underline font-medium"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
