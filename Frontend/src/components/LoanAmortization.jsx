import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LoanAmortization({ loanId, closeModal }) {
  // State variables to store amortizations, member info, input, loading state, error, and schedule existence
  const [amortizations, setAmortizations] = useState([]);
  const [member, setMember] = useState(null);
  const [amortizationInput, setAmortizationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scheduleExists, setScheduleExists] = useState(false);

  // Fetch amortization records and loan member details when component mounts or loanId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const amortizationRes = await axios.get(`http://localhost:8000/api/loans/${loanId}/amortization/`);
        setAmortizations(amortizationRes.data);
        setScheduleExists(amortizationRes.data.length > 0);

        const loanRes = await axios.get(`http://localhost:8000/api/loans/search/${loanId}/`);
        setMember(loanRes.data.member_details);
      } catch (error) {
        console.error('Error fetching loan or amortization data:', error);
      }
    };

    fetchData();
  }, [loanId]);

  // Handle generating a new amortization schedule after validating input
  const handleGenerateSchedule = async () => {
    setError(null);
    if (!amortizationInput || isNaN(amortizationInput) || Number(amortizationInput) <= 0) {
      setError("Please enter a valid amortization amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8000/api/loans/${loanId}/amortization/create/`,
        { amortization: Number(amortizationInput) }
      );
      setAmortizations(res.data);
      setScheduleExists(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate amortization schedule.");
    } finally {
      setLoading(false);
    }
  };

  // Render modal with amortization input or schedule table based on schedule existence
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-h-[80%] overflow-y-auto w-full max-w-4xl shadow-lg">

         <div className="flex justify-end">
          <button onClick={closeModal} className="text-gray-600 hover:text-red-600 text-xl font-semibold leading-none">
            x
          </button>
      </div>

        <h2 className="text-xl font-bold mb-4">Amortization Schedule for Loan {loanId}</h2>

       
      {/* Show input form if no schedule exists */}
        {!scheduleExists && (
          <div className="mb-6 flex flex-col items-center">
            <label
              className="block mb-2 font-semibold text-center"
              htmlFor="amortizationInput"
            >
              Enter Amortization Amount:
            </label>
            <input
              id="amortizationInput"
              type="number"
              step="0.01"
              min="0"
              value={amortizationInput}
              onChange={(e) => setAmortizationInput(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
              disabled={loading}
            />
            {error && <p className="text-red-600 mt-1">{error}</p>}
            <button
              onClick={handleGenerateSchedule}
              disabled={loading}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Schedule"}
            </button>
          </div>
        )}
        {/* Show amortization schedule table if records exist */}
        {amortizations.length > 0 ? (
          <table className="min-w-full table-auto border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Due Date</th>
                <th className="border px-2 py-1">Amortization</th>
                <th className="border px-2 py-1">Principal</th>
                <th className="border px-2 py-1">Interest</th>
                <th className="border px-2 py-1">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {amortizations.map((entry) => (
                <tr key={entry.seq}>
                  <td className="border px-2 py-1 text-center">{entry.seq}</td>
                  <td className="border px-2 py-1">{entry.due_date}</td>
                  <td className="border px-2 py-1">{entry.amortization}</td>
                  <td className="border px-2 py-1">{entry.principal}</td>
                  <td className="border px-2 py-1">{entry.interest}</td>
                  <td className="border px-2 py-1">{entry.remaining_balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : scheduleExists ? (
          <p className="text-center text-gray-600 mt-4">No amortization records found.</p>
        ) : null}
      </div>
    </div>
  );
}
