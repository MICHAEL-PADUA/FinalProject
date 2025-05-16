import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LoanUpdate({ loan, onLoanUpdated, closeModal }) {
    const [updatedLoan, setUpdatedLoan] = useState(loan);
    const [isStatusLocked, setIsStatusLocked] = useState(false);

    useEffect(() => {
        setUpdatedLoan(loan);

        // Lock the status update if it's already set to "released" or "reject"
        if (loan.status === "released" || loan.status === "reject") {
            setIsStatusLocked(true);
        }
    }, [loan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedLoan((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                `http://localhost:8000/api/loans/update/${updatedLoan.id}/`,
                { status: updatedLoan.status } // Only send status
            );
            console.log(response.data);
            onLoanUpdated();
            closeModal();
        } catch (error) {
            console.error('Error updating loan:', error);
            alert('There was an error updating the loan. Please try again later.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-bold mb-4">Update Loan Status</h2>
                <form onSubmit={handleSubmit}>
                    {[  
                        { label: 'Loan Type', value: updatedLoan.loan_type },
                        { label: 'Amount', value: updatedLoan.loan_amount },
                        { label: 'Interest', value: updatedLoan.interest },
                        { label: 'Term', value: updatedLoan.term },
                        { label: 'Grace', value: updatedLoan.grace },
                        { label: 'Start Date', value: updatedLoan.payment_start_date },
                        { label: 'Maturity Date', value: updatedLoan.maturity_date },
                    ].map((field, index) => (
                        <div key={index} className="mb-3">
                            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                            <input
                                type="text"
                                value={field.value}
                                disabled
                                className="w-full border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-600"
                            />
                        </div>
                    ))}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={updatedLoan.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-md"
                            disabled={isStatusLocked}
                        >
                            <option value="pending">Pending</option>
                            <option value="released">Released</option>
                            <option value="reject">Reject</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        disabled={isStatusLocked} 
                    >
                        Update Status
                    </button>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg ml-2"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
