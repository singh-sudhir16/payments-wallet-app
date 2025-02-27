export const Balance = ({ value }) => {
  const formattedValue =  value.toFixed(2);
  
  return (
    <div className="bg-white shadow rounded p-4 flex items-center justify-between">
      <div className="text-lg font-semibold">Current Balance</div>
      <div className="text-2xl font-bold text-green-600">Rs {formattedValue}</div>
    </div>
  );
};
