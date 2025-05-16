import { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function ReportGeneration() {
    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);
    const [loanTypeFilter, setLoanTypeFilter] = useState('All');

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

    useEffect(() => {
        loadLoans();
    }, []);

    useEffect(() => {
        if (loanTypeFilter === 'All') {
            setFilteredLoans(loans);
        } else {
            const filtered = loans.filter(loan => loan.loan_type === loanTypeFilter);
            setFilteredLoans(filtered);
        }
    }, [loanTypeFilter, loans]);

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

    const loanTypes = ['All', ...new Set(loans.map(loan => loan.loan_type))];

    return (
        <div>
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

            <div
                className="overflow-x-auto mt-6"
                style={{ maxHeight: '400px', overflowY: 'scroll' }}
            >
                <table className="min-w-full table-fixed border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="w-1/6 border-b px-4 py-2 text-left">Member ID</th>
                            <th className="w-1/6 border-b px-4 py-2 text-left">Loan ID</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Interest</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Start Date</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Maturity Date</th>
                            <th className="w-1/6 border-b px-4 py-2 text-center">Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length > 0 ? (
                            filteredLoans.map((loan) => (
                                <tr key={loan.id}>
                                    <td className="border-b px-4 py-2 text-left">{loan.member}</td>
                                    <td className="border-b px-4 py-2 text-left">{loan.id}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.interest}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.payment_start_date}</td>
                                    <td className="border-b px-4 py-2 text-center">{loan.maturity_date}</td>
                                    <td className="border-b px-4 py-2 text-center">
                                        <button
                                            onClick={() => downloadReport(loan.id)}
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
        </div>
    );
}
