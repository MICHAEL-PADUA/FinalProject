import { useState, useEffect } from 'react';
import axios from 'axios';
import UserAdd from './UserAdd';
import UserUpdate from './UserUpdate';
import SearchUser from './UserSearch';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('active');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [filterStatus]);

    const loadUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/');
            const filtered = response.data.filter(user =>
                filterStatus === 'active' ? user.is_active === 1 :
                filterStatus === 'inactive' ? user.is_active === 0 :
                true
            );
            setUsers(filtered);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSearch = async (query) => {
        try {
            let response;
            if (!query || query.trim() === '') {
                response = await axios.get('http://localhost:8000/api/users/');
            } else {
                response = await axios.get(`http://localhost:8000/api/users/search/${query}`);
            }

            const filtered = response.data.filter(user =>
                filterStatus === 'active' ? user.is_active === 1 :
                filterStatus === 'inactive' ? user.is_active === 0 :
                true
            );
            setUsers(filtered);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setUsers([]);
        }
    };

    const requestToggleStatus = (user) => {
        setUserToToggle(user);
        setShowConfirmModal(true);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;
        const newStatus = userToToggle.is_active === 1 ? 0 : 1;
        try {
            await axios.patch(
                `http://localhost:8000/api/users/${userToToggle.id}/update/`,
                { is_active: newStatus }
            );
            setUsers(prev => prev.filter(user => user.id !== userToToggle.id));
        } catch (error) {
            console.error('Error updating user status:', error);
        } finally {
            setShowConfirmModal(false);
            setUserToToggle(null);
        }
    };

    const cancelToggleStatus = () => {
        setShowConfirmModal(false);
        setUserToToggle(null);
    };

    const openUpdateModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>

            <div className="flex items-center justify-between mb-4">
                <SearchUser onSearch={handleSearch} />
                <div className="flex items-center space-x-2">
                    <select
                        className="border border-gray-300 px-3 py-2 rounded h-10"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="active">Active Users</option>
                        <option value="inactive">Inactive Users</option>
                    </select>
                    <div className="h-10 flex items-center">
                        <UserAdd onUserAdded={loadUsers} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto mt-6" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border-b px-4 py-2 text-center">ID</th>
                            <th className="border-b px-4 py-2 text-center">Last Name</th>
                            <th className="border-b px-4 py-2 text-center">First Name</th>
                            <th className="border-b px-4 py-2 text-center">Middle Initial</th>
                            <th className="border-b px-4 py-2 text-center">Address</th>
                            <th className="border-b px-4 py-2 text-center">User Type</th>
                            <th className="border-b px-4 py-2 text-center">Username</th>
                            <th className="border-b px-4 py-2 text-center">Status</th>
                            <th className="border-b px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td className="border-b px-4 py-2 text-center">{user.id}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.lastname}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.firstname}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.middleinitial}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.address}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.usertype}</td>
                                    <td className="border-b px-4 py-2 text-center">{user.username}</td>
                                    <td className="border-b px-4 py-2 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-white ${user.is_active === 1 ? 'bg-green-500' : 'bg-gray-500'}`}>
                                            {user.is_active === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="border-b px-4 py-2 text-center">
                                        <button
                                            className="bg-blue-500 text-black px-3 py-1 rounded-lg"
                                            onClick={() => openUpdateModal(user)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-3 py-1 rounded-lg ml-2"
                                            onClick={() => requestToggleStatus(user)}
                                        >
                                            {user.is_active === 1 ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No Records Found!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && selectedUser && (
                <UserUpdate
                    user={selectedUser}
                    onUserUpdated={loadUsers}
                    closeModal={closeModal}
                />
            )}

            {showConfirmModal && userToToggle && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">
                            {userToToggle.is_active === 1 ? 'Deactivate User' : 'Activate User'}
                        </h3>
                        <p className="mb-4">
                            Are you sure you want to {userToToggle.is_active === 1 ? 'deactivate' : 'activate'}{' '}
                            <strong>{userToToggle.firstname} {userToToggle.lastname}</strong>?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cancelToggleStatus}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
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
