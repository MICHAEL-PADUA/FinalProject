import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LoanAdd({ onLoanAdded, closeAddModal }) {
    // State declarations
    const [loanID, setLoanID] = useState('');
    const [loanType, setLoanType] = useState('quick');
    const [loanAmount, setLoanAmount] = useState('');
    const [interest, setInterest] = useState('');
    const [term, setTerm] = useState('');
    const [grace, setGrace] = useState('');
    const [paymentStartDate, setPaymentStartDate] = useState('');
    const [maturityDate, setMaturityDate] = useState('');
    const [status, setStatus] = useState('pending');
    const [memberID, setMemberID] = useState(''); // State for selected member
    const [members, setMembers] = useState([]); // State to hold members
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Fetch members on component mount
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/members/');
                setMembers(response.data); 
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchMembers();
    }, []);

    // Set interest rate based on loan type
    useEffect(() => {
        switch (loanType) {
            case 'quick':
                setInterest(5);
                break;
            case 'salary':
                setInterest(6);
                break;
            case 'emergency':
                setInterest(7);
                break;
            case 'multipurpose':
                setInterest(8);
                break;
            default:
                setInterest(5);
                break;
        }
    }, [loanType]); // This effect runs whenever loanType changes

    const handleAddLoan = async () => {
        try {
            await axios.post('http://localhost:8000/api/loans/create/', {
                loan_ID: loanID,
                loan_type: loanType,
                loan_amount: loanAmount,
                interest,
                term,
                grace,
                payment_start_date: paymentStartDate,
                maturity_date: maturityDate,
                status,
                member: memberID,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Clear fields
            setLoanID('');
            setLoanType('quick');
            setLoanAmount('');
            setInterest('');
            setTerm('');
            setGrace('');
            setPaymentStartDate('');
            setMaturityDate('');
            setStatus('pending');
            setMemberID(''); // Reset member selection

            onLoanAdded();
            closeAddModal();
        } catch (error) {
            console.error('Error adding loan:', error.response ? error.response.data : error.message);
        }
    };

    const openConfirmationModal = () => {
        setShowConfirmation(true);
    };

    const closeConfirmationModal = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-3">Add Loan</h2>

                {/* Member Selection */}
                <label className="block text-sm font-medium text-gray-700">Member:</label>
                <select
                    value={memberID}
                    onChange={(e) => setMemberID(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-4"
                >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                        <option key={member.id} value={member.id}>
                            {member.firstname} {member.lastname}
                        </option>
                    ))}
                </select>

                {/* Loan Type */}
                <label className="block text-sm font-medium text-gray-700">Loan Type:</label>
                <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                >
                    <option value="quick">Quick</option>
                    <option value="salary">Salary</option>
                    <option value="emergency">Emergency</option>
                    <option value="multipurpose">Multipurpose</option>
                </select>

                {/* Loan Amount */}
                <label className="block text-sm font-medium text-gray-700">Loan Amount:</label>
                <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Interest Rate (Auto-Updated) */}
                <label className="block text-sm font-medium text-gray-700">Interest Rate (%):</label>
                <input
                    type="number"
                    value={interest}
                    readOnly
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Term (Months) */}
                <label className="block text-sm font-medium text-gray-700">Term (Months):</label>
                <input
                    type="number"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Grace Period (Months) */}
                <label className="block text-sm font-medium text-gray-700">Grace Period (Months):</label>
                <input
                    type="number"
                    value={grace}
                    onChange={(e) => setGrace(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Payment Start Date */}
                <label className="block text-sm font-medium text-gray-700">Payment Start Date:</label>
                <input
                    type="date"
                    value={paymentStartDate}
                    onChange={(e) => setPaymentStartDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Maturity Date */}
                <label className="block text-sm font-medium text-gray-700">Maturity Date:</label>
                <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-2"
                />

                {/* Status */}
                <label className="block text-sm font-medium text-gray-700">Status:</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-1.5 mb-4"
                >
                    <option value="pending">Pending</option>
                    <option value="released">Released</option>
                    <option value="reject">Rejected</option>
                    
                </select>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={openConfirmationModal}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Add Loan
                    </button>
                    <button
                        onClick={closeAddModal}
                        className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3">Confirm Loan Addition</h2>
                        
                        <div className="mb-4">
                            <p className="mb-2">Are you sure you want to add this loan with the following details?</p>
                            
                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                                <p><span className="font-medium">Member:</span> {members.find(m => m.id === memberID)?.firstname} {members.find(m => m.id === memberID)?.lastname}</p>
                                <p><span className="font-medium">Loan Type:</span> {loanType}</p>
                                <p><span className="font-medium">Amount:</span> {loanAmount}</p>
                                <p><span className="font-medium">Interest Rate:</span> {interest}%</p>
                                <p><span className="font-medium">Term:</span> {term} months</p>
                                <p><span className="font-medium">Grace Period:</span> {grace} months</p>
                                <p><span className="font-medium">Payment Start:</span> {paymentStartDate}</p>
                                <p><span className="font-medium">Maturity Date:</span> {maturityDate}</p>
                                <p><span className="font-medium">Status:</span> {status}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleAddLoan}
                                className="bg-green-500 text-white px-4 py-2 rounded-md"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={closeConfirmationModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
