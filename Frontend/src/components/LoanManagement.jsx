import { useState, useEffect } from 'react';
import axios from 'axios';
import LoanAdd from './LoanAdd';
import LoanAmortization from './LoanAmortization';

export default function LoanManagement() {
    // State declarations
    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [amortizationLoanId, setAmortizationLoanId] = useState(null);
    const [loanTypeFilter, setLoanTypeFilter] = useState('All');
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [selectedNewStatus, setSelectedNewStatus] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load loans from backend and sort by most recent payment start date
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

    // Initial load of loans on component mount
    useEffect(() => {
        loadLoans();
    }, []);

    // Update filtered loans when loan type filter changes
    useEffect(() => {
        if (loanTypeFilter === 'All') {
            setFilteredLoans(loans);
        } else {
            const filtered = loans.filter(loan => loan.loan_type === loanTypeFilter);
            setFilteredLoans(filtered);
        }
    }, [loanTypeFilter, loans]);

    // Modal handlers
    const openAddModal = () => setShowAddModal(true);
    const closeAddModal = () => setShowAddModal(false);

    const openAmortizationModal = (loanId) => setAmortizationLoanId(loanId);
    const closeAmortizationModal = () => setAmortizationLoanId(null);

    // Open confirmation modal before changing loan status
    const openConfirmModal = (loanId, newStatus) => {
        setSelectedLoanId(loanId);
        setSelectedNewStatus(newStatus);
        setShowConfirmModal(true);
    };

    // Confirm loan status change and update via API
    const confirmStatusChange = async () => {
        try {
            await axios.put(`http://localhost:8000/api/loans/update/${selectedLoanId}/`, {
                status: selectedNewStatus
            });
            setShowConfirmModal(false);
            setSelectedLoanId(null);
            setSelectedNewStatus('');
            loadLoans(); // Refresh loan list
        } catch (error) {
            console.error('Error updating loan status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    // Cancel status change action
    const cancelStatusChange = () => {
        setShowConfirmModal(false);
        setSelectedLoanId(null);
        setSelectedNewStatus('');
    };

    // Extract unique loan types for filtering dropdown
    const loanTypes = ['All', ...new Set(loans.map(loan => loan.loan_type))];

    return (
        <div>
            {/* Top controls: Add Loan Button and Filter Dropdown */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={openAddModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    Add Loan
                </button>
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

            {/* Loans Table */}
            <div className="overflow-x-auto mt-6" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border-b px-4 py-2 text-center">Member</th>
                            <th className="border-b px-4 py-2 text-center">Loan ID</th>
                            <th className="border-b px-4 py-2 text-center">Type</th>
                            <th className="border-b px-4 py-2 text-center">Amount</th>
                            <th className="border-b px-4 py-2 text-center">Interest</th>
                            <th className="border-b px-4 py-2 text-center">Term</th>
                            <th className="border-b px-4 py-2 text-center">Grace</th>
                            <th className="border-b px-4 py-2 text-center">Start</th>
                            <th className="border-b px-4 py-2 text-center">Maturity</th>
                            <th className="border-b px-4 py-2 text-center">Status</th>
                            <th className="border-b px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length > 0 ? (
                            filteredLoans.map((loan) => {
                                const isStatusLocked = loan.status === "released" || loan.status === "reject";

                                return (
                                    <tr key={loan.id}>
                                        <td className="border-b px-4 py-2 text-center">{loan.member_details.lastname}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.id}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.loan_type}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.loan_amount}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.interest}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.term}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.grace}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.payment_start_date}</td>
                                        <td className="border-b px-4 py-2 text-center">{loan.maturity_date}</td>
                                        <td className="border-b px-4 py-2 text-center">
                                            <select
                                                value={loan.status}
                                                disabled={isStatusLocked}
                                                onChange={(e) => openConfirmModal(loan.id, e.target.value)}
                                                className={`border rounded-md px-2 py-1 ${isStatusLocked ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="released">Released</option>
                                                <option value="reject">Reject</option>
                                            </select>
                                        </td>
                                        <td className="border-b px-4 py-2 text-center">
                                            <button
                                                className="bg-green-500 text-black px-3 py-1 rounded-lg ml-2"
                                                onClick={() => openAmortizationModal(loan.id)}
                                            >
                                                Amortization
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center py-4">No Records Found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Loan Add Modal */}
            {showAddModal && (
                <LoanAdd
                    onLoanAdded={loadLoans}
                    closeAddModal={closeAddModal}
                />
            )}

            {/* Amortization Schedule Modal */}
            {amortizationLoanId && (
                <LoanAmortization
                    loanId={amortizationLoanId}
                    closeModal={closeAmortizationModal}
                />
            )}

            {/* Status Change Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Confirm Status Change</h2>
                        <p className="mb-6">
                            Are you sure you want to change the loan status to <strong>{selectedNewStatus}</strong>?
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={cancelStatusChange}
                                className="px-4 py-2 mr-3 bg-gray-300 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
