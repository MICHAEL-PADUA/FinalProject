import { useState, useEffect } from 'react';
import axios from 'axios';
import placeholderImage from '../resources/PlaceholderPic.webp';
import MemberAdd from './MemberAdd';
import MemberUpdate from './MemberUpdate';
import MemberSearch from './MemberSearch';

export default function MemberManagement() {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isAddMember, setIsAddMember] = useState(false);
    const [hoveredMemberId, setHoveredMemberId] = useState(null);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/members/');
            setMembers(response.data);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    const handleSearch = async (query) => {
        if (!query) {
            loadMembers();
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8000/api/members/search/${query}/`);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setMembers([]);
        }
    };

    const openModal = (member) => {
        setSelectedMember(member);
        setShowModal(true);
        setIsAddMember(false);
    };

    const openAddMemberModal = () => {
        setShowModal(true);
        setIsAddMember(true);
        setSelectedMember(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedMember(null);
    };

    const openUpdateModal = () => {
        setShowUpdateModal(true);
        setShowModal(false);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
    };

    const handleAddMember = (newMember) => {
        setMembers((prev) => [...prev, newMember]);
        closeModal();
    };

    const handleUpdateMember = (updatedMember) => {
        setMembers((prev) =>
            prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
        );
        closeUpdateModal();
    };

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-xl font-bold mb-4">Member Management</h2>

            {/* Container for Search and Add Member button aligned horizontally */}
            <div className="flex items-center justify-between mb-4">
                <MemberSearch onSearch={handleSearch} />
                <button
                    onClick={openAddMemberModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Member
                </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pl-14">
                    {members.length > 0 ? (
                        members.map((member) => {
                            const isHovered = hoveredMemberId === member.id;
                            const memberImageUrl = member.member_picture
                                ? `http://localhost:8000${member.member_picture}`
                                : placeholderImage;

                            return (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-md shadow-sm p-2 cursor-pointer hover:shadow-md transition w-32 relative"
                                    onClick={() => openModal(member)}
                                    onMouseEnter={() => setHoveredMemberId(member.id)}
                                    onMouseLeave={() => setHoveredMemberId(null)}
                                >
                                    <img
                                        src={isHovered ? memberImageUrl : placeholderImage}
                                        alt="Member"
                                        className="w-full h-20 object-cover rounded mb-1 transition duration-200"
                                        onError={(e) => (e.target.src = placeholderImage)}
                                    />
                                    <div className="text-center text-xs font-medium">
                                        {member.service_no}
                                        <br />
                                        {member.lastname}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center col-span-3 text-sm">No Records Found!</p>
                    )}
                </div>
            </div>

            {/* Modal for Add Member or Member Details */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-md shadow-lg w-full max-w-2xl overflow-y-auto max-h-[600px]">
                        {isAddMember ? (
                            <MemberAdd onAdd={handleAddMember} />
                        ) : (
                            <>
                                <h2 className="text-lg font-bold mb-2">Member Details</h2>
                                <p className="text-sm mt-2">
                                    <strong>Picture:</strong>
                                    <img
                                        src={
                                            selectedMember?.member_picture
                                                ? `http://localhost:8000${selectedMember.member_picture}`
                                                : placeholderImage
                                        }
                                        alt="Member"
                                        onError={(e) => (e.target.src = placeholderImage)}
                                        className="mt-1 w-full h-auto max-h-48 object-contain border border-gray-300"
                                    />
                                </p>
                                <p className="text-sm"><strong>Last Name:</strong> {selectedMember?.lastname}</p>
                                <p className="text-sm"><strong>First Name:</strong> {selectedMember?.firstname}</p>
                                <p className="text-sm"><strong>Middle Name:</strong> {selectedMember?.middlename}</p>
                                <p className="text-sm"><strong>Nationality:</strong> {selectedMember?.nationality}</p>
                                <p className="text-sm"><strong>Sex:</strong> {selectedMember?.sex}</p>
                                <p className="text-sm"><strong>Branch of Service:</strong> {selectedMember?.branch_of_service}</p>
                                <p className="text-sm"><strong>Service No:</strong> {selectedMember?.service_no}</p>
                                <p className="text-sm"><strong>Office Business Address:</strong> {selectedMember?.office_business_address}</p>
                                <p className="text-sm"><strong>Unit Assignment:</strong> {selectedMember?.unit_assignment}</p>
                                <p className="text-sm"><strong>Unit/Office Telephone No:</strong> {selectedMember?.unit_office_telephone_no}</p>
                                <p className="text-sm"><strong>Occupation/Designation:</strong> {selectedMember?.occupation_designation}</p>
                                <p className="text-sm"><strong>Source of Income:</strong> {selectedMember?.source_of_income}</p>
                                <p className="text-sm mt-4">
                                    <strong>Signature:</strong>
                                    <img
                                        src={selectedMember?.member_signature}
                                        alt="Signature"
                                        className="mt-1 w-full h-auto max-h-32 object-contain border border-gray-300"
                                        onError={(e) => (e.target.src = placeholderImage)}
                                    />
                                </p>

                                <div className="flex justify-between mt-6">
                                    <button
                                        onClick={openUpdateModal}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Update Member
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="bg-gray-300 text-black px-4 py-2 rounded"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal for Update Member */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">Update Member</h2>
                        <MemberUpdate
                            selectedMember={selectedMember}
                            onUpdate={handleUpdateMember}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeUpdateModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded"
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
