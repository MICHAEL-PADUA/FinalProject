import { useState } from 'react';

export default function MemberSearch({ onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
         // If searchQuery is empty, fetch all members by sending empty string or some keyword
        onSearch(searchQuery.trim());
    };

    return (
        <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
                type="text"
                placeholder="Search Member"
                value={searchQuery}
                onChange={handleSearchChange}
                className="px-4 py-2 border rounded"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
            >
                Search
            </button>
        </form>
    );
}
