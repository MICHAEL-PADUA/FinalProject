import { useState, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

export default function MemberAdd({ onAdd }) {
    const [loading, setLoading] = useState(false);
    const [memberPicture, setMemberPicture] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [errors, setErrors] = useState({});
    const [newMember, setNewMember] = useState({
        lastname: '',
        firstname: '',
        middlename: '',
        nationality: '',
        sex: '',
        branch_of_service: '',
        service_no: '',
        office_business_address: '',
        unit_office_telephone_no: '',
        unit_assignment:'',
        occupation_designation: '',
        source_of_income: '',
        signature: '', 
        member_picture: null,
    });

    const signaturePadRef = useRef(null); 

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'member_picture') {
            setNewMember(prev => ({
                ...prev,
                member_picture: files[0]
            }));
        } else {
            setNewMember(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };
    
    const handleSignature = () => {
        if (signaturePadRef.current.isEmpty()) {
            setErrors(prev => ({
                ...prev,
                signature: "Please provide a signature first."
            }));
            return;
        }
    
        const rawCanvas = signaturePadRef.current.getCanvas();
    
        const tempCanvas = document.createElement("canvas");
        const scale = 0.5; // Reduce to 50% size
        tempCanvas.width = rawCanvas.width * scale;
        tempCanvas.height = rawCanvas.height * scale;
    
        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(rawCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
        const compressedDataUrl = tempCanvas.toDataURL("image/png", 0.6); 
    
        setNewMember(prev => ({
            ...prev,
            member_signature: compressedDataUrl,
        }));
        
        // Clear signature error if it exists
        if (errors.signature) {
            setErrors(prev => ({
                ...prev,
                signature: null
            }));
        }
    
        console.log("Saved signature:", compressedDataUrl);
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'lastname', 'firstname', 'nationality', 'sex', 
            'branch_of_service', 'service_no', 'office_business_address',
            'unit_office_telephone_no', 'unit_assignment', 
            'occupation_designation', 'source_of_income'
        ];
        
        requiredFields.forEach(field => {
            if (!newMember[field]) {
                newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
            }
        });
        
        // Check if signature exists
        if (!newMember.member_signature) {
            newErrors.signature = "Signature is required. Please sign and save.";
        }
        
        // Check if member picture exists
        if (!memberPicture) {
            newErrors.member_picture = "Member picture is required.";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const openConfirmationModal = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setShowConfirmation(true);
        } else {
            // Scroll to the first error
            const firstErrorField = document.querySelector('.error-message');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const closeConfirmationModal = () => {
        setShowConfirmation(false);
    };
    
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true); // Set loading to true when submitting
        setShowConfirmation(false); // Close confirmation modal
        
        const formData = new FormData();
        Object.entries(newMember).forEach(([key, value]) => {
            formData.append(key, value);
        });
    
        if (memberPicture) {
            formData.append("member_picture", memberPicture);
        }
    
        try {
            const response = await axios.post('http://localhost:8000/api/members/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 10000,
            });
    
            onAdd(response.data); 
            setNewMember({ 
                lastname: '',
                firstname: '',
                middlename: '',
                nationality: '',
                sex: '',
                branch_of_service: '',
                service_no: '',
                office_business_address: '',
                unit_office_telephone_no: '',
                unit_assignment: '',
                occupation_designation: '',
                source_of_income: '',
                signature: '',
                member_picture: null,
            });
            setErrors({});
            setMemberPicture(null);
            signaturePadRef.current.clear(); // Clear the signature pad
        } catch (error) {
            console.error("Failed to add member:", error);
            // Handle API errors
            if (error.response?.data) {
                setErrors(prev => ({
                    ...prev,
                    apiError: "Error from server: " + JSON.stringify(error.response.data)
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    apiError: "Network error occurred. Please try again."
                }));
            }
        } finally {
            setLoading(false); 
        }
    };
    
    // Added function to handle page refresh when Cancel button is clicked
    const handleCancel = () => {
        // First call the onAdd function (likely to close the form)
        if (onAdd) {
            onAdd();
        }
        
        // Then refresh the page
        window.location.reload();
    };
    
    return (
        <div className="bg-white p-4 rounded-md shadow-lg w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-2">Add New Member</h2>
            
           
            {errors.apiError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {errors.apiError}
                </div>
            )}
            
            <form onSubmit={openConfirmationModal} className="max-h-[500px] overflow-y-auto">
                <div className="mb-2">
                    <label htmlFor="lastname" className="block text-sm font-medium">Last Name*</label>
                    <input
                        id="lastname"
                        name="lastname"
                        type="text"
                        value={newMember.lastname}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.lastname ? 'border-red-500' : ''}`}
                    />
                    {errors.lastname && <p className="text-red-500 text-xs mt-1 error-message">{errors.lastname}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="firstname" className="block text-sm font-medium">First Name*</label>
                    <input
                        id="firstname"
                        name="firstname"
                        type="text"
                        value={newMember.firstname}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.firstname ? 'border-red-500' : ''}`}
                    />
                    {errors.firstname && <p className="text-red-500 text-xs mt-1 error-message">{errors.firstname}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="middlename" className="block text-sm font-medium">Middle Name</label>
                    <input
                        id="middlename"
                        name="middlename"
                        type="text"
                        value={newMember.middlename}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-2">
                    <label htmlFor="nationality" className="block text-sm font-medium">Nationality*</label>
                    <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        value={newMember.nationality}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.nationality ? 'border-red-500' : ''}`}
                    />
                    {errors.nationality && <p className="text-red-500 text-xs mt-1 error-message">{errors.nationality}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="sex" className="block text-sm font-medium">Sex*</label>
                    <select
                        id="sex"
                        name="sex"
                        value={newMember.sex}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.sex ? 'border-red-500' : ''}`}
                    >
                        <option value="">Select Sex</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                    {errors.sex && <p className="text-red-500 text-xs mt-1 error-message">{errors.sex}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="branch_of_service" className="block text-sm font-medium">Branch of Service*</label>
                    <select
                        id="branch_of_service"
                        name="branch_of_service"
                        value={newMember.branch_of_service}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.branch_of_service ? 'border-red-500' : ''}`}
                    >
                        <option value="">Select</option>
                        <option value="Armed Forces">Armed Forces</option>
                        <option value="Philippine Coast Guard">Philippine Coast Guard</option>
                        <option value="Philippine Army">Philippine Army</option>
                        <option value="Philippine Marine Corps">Philippine Marine Corps</option>
                        <option value="Bureau of Fire Protection">Bureau of Fire Protection</option>
                        <option value="Philippine Navy">Philippine Navy</option>
                        <option value="Bureau of Jail Management and Penology">Bureau of Jail Management and Penology</option>
                    </select>
                    {errors.branch_of_service && <p className="text-red-500 text-xs mt-1 error-message">{errors.branch_of_service}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="service_no" className="block text-sm font-medium">Service No*</label>
                    <input
                        id="service_no"
                        name="service_no"
                        type="text"
                        value={newMember.service_no}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.service_no ? 'border-red-500' : ''}`}
                    />
                    {errors.service_no && <p className="text-red-500 text-xs mt-1 error-message">{errors.service_no}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="office_business_address" className="block text-sm font-medium">Office/Business Address*</label>
                    <input
                        id="office_business_address"
                        name="office_business_address"
                        type="text"
                        value={newMember.office_business_address}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.office_business_address ? 'border-red-500' : ''}`}
                    />
                    {errors.office_business_address && <p className="text-red-500 text-xs mt-1 error-message">{errors.office_business_address}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="unit_office_telephone_no" className="block text-sm font-medium">Unit/Office Telephone No*</label>
                    <input
                        id="unit_office_telephone_no"
                        name="unit_office_telephone_no"
                        type="text"
                        value={newMember.unit_office_telephone_no}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.unit_office_telephone_no ? 'border-red-500' : ''}`}
                    />
                    {errors.unit_office_telephone_no && <p className="text-red-500 text-xs mt-1 error-message">{errors.unit_office_telephone_no}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="unit_assignment" className="block text-sm font-medium">Unit Assignment*</label>
                    <input
                        id="unit_assignment"
                        name="unit_assignment"
                        type="text"
                        value={newMember.unit_assignment}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.unit_assignment ? 'border-red-500' : ''}`}
                    />
                    {errors.unit_assignment && <p className="text-red-500 text-xs mt-1 error-message">{errors.unit_assignment}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="occupation_designation" className="block text-sm font-medium">Occupation/Designation*</label>
                    <input
                        id="occupation_designation"
                        name="occupation_designation"
                        type="text"
                        value={newMember.occupation_designation}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.occupation_designation ? 'border-red-500' : ''}`}
                    />
                    {errors.occupation_designation && <p className="text-red-500 text-xs mt-1 error-message">{errors.occupation_designation}</p>}
                </div>
                <div className="mb-2">
                    <label htmlFor="source_of_income" className="block text-sm font-medium">Source of Income*</label>
                    <input
                        id="source_of_income"
                        name="source_of_income"
                        type="text"
                        value={newMember.source_of_income}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.source_of_income ? 'border-red-500' : ''}`}
                    />
                    {errors.source_of_income && <p className="text-red-500 text-xs mt-1 error-message">{errors.source_of_income}</p>}
                </div>

                <div className="mb-2">
                    <label htmlFor="member_picture" className="block text-sm font-medium">Member Picture*</label>
                    <input
                        type="file"
                        id="member_picture"
                        name="member_picture"
                        accept="image/*"
                        onChange={(e) => {
                            setMemberPicture(e.target.files[0]);
                            // Clear error when file is selected
                            if (errors.member_picture && e.target.files[0]) {
                                setErrors(prev => ({
                                    ...prev,
                                    member_picture: null
                                }));
                            }
                        }}
                        className={`w-full p-2 border rounded ${errors.member_picture ? 'border-red-500' : ''}`}
                    />
                    {errors.member_picture && <p className="text-red-500 text-xs mt-1 error-message">{errors.member_picture}</p>}
                </div>

                {/* Signature field using react-signature-canvas */}
                <div className="mb-4">
                    <label htmlFor="signature" className="block text-sm font-medium">Signature*</label>
                    <SignatureCanvas
                        ref={signaturePadRef}
                        penColor="black"
                        backgroundColor='rgba(255, 255, 255, 0)' // Transparent background
                        canvasProps={{ width: 300, height: 150, className: `border rounded ${errors.signature ? 'border-red-500' : ''}` }}
                    />
                    {errors.signature && <p className="text-red-500 text-xs mt-1 error-message">{errors.signature}</p>}
                    <div className="flex justify-between mt-2">
                        <button
                            type="button"
                            onClick={() => {
                                signaturePadRef.current.clear();
                                // If there was a signature and it's cleared, set the error
                                if (newMember.member_signature) {
                                    setNewMember(prev => ({
                                        ...prev,
                                        member_signature: null
                                    }));
                                }
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleSignature}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Save Signature
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">* Required fields</p>
                </div>

                <div className="flex justify-between mt-3">
                    <button
                        type="submit"
                        className={`bg-blue-500 text-white px-3 py-1 rounded text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading} // Disable the submit button while loading
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel} // Changed to use our new function
                        className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
                    >
                        Close
                    </button>
                    {loading && (
                    <div className="mt-4 flex justify-center">
                        <div className="spinner-border animate-spin border-4 border-t-4 border-blue-500 rounded-full w-6 h-6"></div>
                    </div>
                    )}
                </div>
            </form>
            
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-3">Confirm Member Addition</h2>
                        
                        <div className="mb-4 max-h-96 overflow-y-auto">
                            <p className="mb-2">Are you sure you want to add this member with the following details?</p>
                            
                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                                <p><span className="font-medium">Name:</span> {newMember.firstname} {newMember.middlename} {newMember.lastname}</p>
                                <p><span className="font-medium">Nationality:</span> {newMember.nationality}</p>
                                <p><span className="font-medium">Sex:</span> {newMember.sex === 'M' ? 'Male' : newMember.sex === 'F' ? 'Female' : ''}</p>
                                <p><span className="font-medium">Branch of Service:</span> {newMember.branch_of_service}</p>
                                <p><span className="font-medium">Service No:</span> {newMember.service_no}</p>
                                <p><span className="font-medium">Office/Business Address:</span> {newMember.office_business_address}</p>
                                <p><span className="font-medium">Unit/Office Tel No:</span> {newMember.unit_office_telephone_no}</p>
                                <p><span className="font-medium">Unit Assignment:</span> {newMember.unit_assignment}</p>
                                <p><span className="font-medium">Occupation/Designation:</span> {newMember.occupation_designation}</p>
                                <p><span className="font-medium">Source of Income:</span> {newMember.source_of_income}</p>
                                <p><span className="font-medium">Member Picture:</span> {memberPicture ? memberPicture.name : 'None'}</p>
                                <p><span className="font-medium">Signature:</span> {newMember.member_signature ? 'Provided' : 'Not provided'}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleSubmit}
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