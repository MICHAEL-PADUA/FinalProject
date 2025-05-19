import { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function ReportGeneration() {
    // State variables
    const [loans, setLoans] = useState([]); 
    const [filteredLoans, setFilteredLoans] = useState([]); 
    const [loanTypeFilter, setLoanTypeFilter] = useState('All'); 
    const [showModal, setShowModal] = useState(false); 
    const [selectedLoanId, setSelectedLoanId] = useState(null); 
    // Fetch loans from API and sort them by start date (most recent first)
    const loadLoans = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/loans/');
            const sortedLoans = response.data.sort(
                (a, b) => new Date(b.payment_start_date) - new Date(a.payment_start_date)
            );
            setLoans(sortedLoans);
            setFilteredLoans(sortedLoans);
        } catch (error) {
            console.error('Error loading loans:', error);
        }
    };

    // Initial load: Fetch all loan records
    useEffect(() => {
        loadLoans();
    }, []);

    // Update filtered loans whenever the filter or loans list changes
    useEffect(() => {
        if (loanTypeFilter === 'All') {
            setFilteredLoans(loans);
        } else {
            const filtered = loans.filter(loan => loan.loan_type === loanTypeFilter);
            setFilteredLoans(filtered);
        }
    }, [loanTypeFilter, loans]);

    // Download loan report from backend as an Excel file
    const downloadReport = async (loanId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/loans/${loanId}/report/`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `Loan_Report_${loanId}.xlsx`);
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    // Show confirmation modal before downloading report
    const handleDownloadClick = (loanId) => {
        setSelectedLoanId(loanId);
        setShowModal(true);
    };

    // Called when user confirms report download
    const confirmDownload = () => {
        if (selectedLoanId) {
            downloadReport(selectedLoanId);
            setShowModal(false);
            setSelectedLoanId(null);
        }
    };

    // Cancel the download operation and close the modal
    const cancelDownload = () => {
        setShowModal(false);
        setSelectedLoanId(null);
    };

    // Get all loan types dynamically and include "All" option for filtering
    const loanTypes = ['All', ...new Set(loans.map(loan => loan.loan_type))];

    return (
        <div>
            {/* Filter dropdown */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <label className="mr-2 font-semibold">Filter by Type:</label>
                    <select
                        value={loanTypeFilter}
                        onChange={(e) => setLoanTypeFilter(e.target.value)}
                        className="border px-2 py-1 rounded-md"
                    >
                        {loanTypes.map((type, index) => (
                            <option key={index} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loans table */}
            <div className="overflow-x-auto mt-6" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <table className="min-w-full table-fixed border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Member ID</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Loan ID</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Interest</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Start Date</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Maturity Date</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Show filtered loans or a message if none are found */}
                        {filteredLoans.length > 0 ? (
                            filteredLoans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="border-b px-4 py-2 text-center">{loan.member}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.id}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.interest}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.payment_start_date}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.maturity_date}</td>
                                    <td className="border-b px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleDownloadClick(loan.id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded-md"
                                        >
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No Records Found!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Download confirmation modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Confirm Download</h2>
                        <p className="mb-6">Are you sure you want to download this loan report?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelDownload}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDownload}
                                className="px-4 py-2 rounded bg-blue-600 text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
