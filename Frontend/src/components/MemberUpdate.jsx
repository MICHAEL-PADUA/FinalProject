import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';


export default function MemberUpdate({ selectedMember, onUpdate }) {
  
    const [formData, setFormData] = useState({
        lastname: '',
        firstname: '',
        middlename: '',
        nationality: '',
        sex: '',
        branch_of_service: '',
        service_no: '',
        office_business_address: '',
        unit_assignment: '',
        unit_office_telephone_no: '',
        occupation_designation: '',
        source_of_income: '',
        member_signature: '',
    });
    const [memberPicture, setMemberPicture] = useState(null); // Image file
    const [previewPicture, setPreviewPicture] = useState(null); // For preview
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const signaturePadRef = useRef(null);
    
    // Add error state to track validation errors
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Populate form data when selectedMember changes
    useEffect(() => {
        if (selectedMember) {
            setFormData({
                lastname: selectedMember.lastname || '',
                firstname: selectedMember.firstname || '',
                middlename: selectedMember.middlename || '',
                nationality: selectedMember.nationality || '',
                sex: selectedMember.sex || '',
                branch_of_service: selectedMember.branch_of_service || '',
                service_no: selectedMember.service_no || '',
                office_business_address: selectedMember.office_business_address || '',
                unit_assignment: selectedMember.unit_assignment || '',
                unit_office_telephone_no: selectedMember.unit_office_telephone_no || '',
                occupation_designation: selectedMember.occupation_designation || '',
                source_of_income: selectedMember.source_of_income || '',
                member_signature: '',
            });

            // Set image preview from backend
            setPreviewPicture(selectedMember.member_picture ? `http://localhost:8000${selectedMember.member_picture}` : null);
            
            // Clear any previous errors
            setErrors({});
        }
    }, [selectedMember]);

    // Handle text input changes and clear corresponding error
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle member picture upload and create preview URL
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setMemberPicture(file);
        if (file) {
            setPreviewPicture(URL.createObjectURL(file));
            // Clear any image-related errors
            if (errors.member_picture) {
                setErrors(prev => ({
                    ...prev,
                    member_picture: ''
                }));
            }
        }
    };

    // Validate form fields before submission
    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'lastname', 
            'firstname', 
            'nationality', 
            'sex', 
            'branch_of_service', 
            'service_no'
        ];

        // Check required text fields
        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        // Check if member has either existing picture or is uploading new one
        if (!previewPicture && !memberPicture) {
            newErrors.member_picture = 'Member picture is required';
        }

        // Check signature only if user cleared the signature pad
        if (signaturePadRef.current && signaturePadRef.current.isEmpty() && !selectedMember.member_signature) {
            newErrors.member_signature = 'Signature is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Show confirmation modal if form is valid
    const handleOpenConfirmModal = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowConfirmModal(true);
        } else {
            // Scroll to the first error
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    // Close confirmation modal without submitting
    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    // Clear signature error when user signs the pad
    const handleSignature = () => {
        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
            // Clear signature error if present
            if (errors.member_signature) {
                setErrors(prev => ({
                    ...prev,
                    member_signature: ''
                }));
            }
        }
    };

    // Process form submission after confirmation
    const handleConfirmSubmit = async () => {
        if (!validateForm()) {
            setShowConfirmModal(false);
            return;
        }

        setLoading(true);
        const updateData = new FormData();

        // Add all form fields to FormData object
        for (const [key, value] of Object.entries(formData)) {
            updateData.append(key, value);
        }

        // Add signature data if provided, otherwise keep existing signature
        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
            const signatureData = signaturePadRef.current.toDataURL();
            updateData.append('member_signature', signatureData);
        } else {
            // If the signature pad is empty, keep the existing signature
            updateData.append('member_signature', selectedMember.member_signature || '');
        }
    
        // Add picture file if provided
        if (memberPicture) {
            updateData.append('member_picture', memberPicture);
        }

        // Submit update to API endpoint
        try {
            const response = await axios.put(
                `http://localhost:8000/api/members/${selectedMember.id}/update/`,
                updateData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setShowConfirmModal(false);
            setLoading(false);
            onUpdate(response.data);
        } catch (error) {
            console.error('Update failed:', error);
            setLoading(false);
            // Handle API validation errors
            if (error.response && error.response.data) {
                setErrors(prev => ({
                    ...prev,
                    ...error.response.data
                }));
            } else {
                alert('Failed to update member.');
            }
            setShowConfirmModal(false);
        }
    };

    return (
        <>
            {/* Main form with responsive grid layout */}
            <form onSubmit={handleOpenConfirmModal} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="md:col-span-2 mb-2 text-sm text-gray-500">
                    Fields marked with an asterisk (*) are required.
                </div>
                
             
                <div>
                    <label className="block">
                        Lastname: <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`border ${errors.lastname ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    />
                    {errors.lastname && <p className="text-red-500 text-xs mt-1 error-message">{errors.lastname}</p>}
                </div>
                
                <div>
                    <label className="block">
                        Firstname: <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={`border ${errors.firstname ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    />
                    {errors.firstname && <p className="text-red-500 text-xs mt-1 error-message">{errors.firstname}</p>}
                </div>
                
                <div>
                    <label className="block">Middlename:</label>
                    <input
                        type="text"
                        name="middlename"
                        value={formData.middlename}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>
                
                <div>
                    <label className="block">
                        Nationality: <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className={`border ${errors.nationality ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    />
                    {errors.nationality && <p className="text-red-500 text-xs mt-1 error-message">{errors.nationality}</p>}
                </div>
                
                <div>
                    <label className="block">
                        Sex: <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className={`border ${errors.sex ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                    {errors.sex && <p className="text-red-500 text-xs mt-1 error-message">{errors.sex}</p>}
                </div>
                
                <div>
                    <label className="block">
                        Branch of Service: <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="branch_of_service"
                        value={formData.branch_of_service}
                        onChange={handleChange}
                        className={`border ${errors.branch_of_service ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    />
                    {errors.branch_of_service && <p className="text-red-500 text-xs mt-1 error-message">{errors.branch_of_service}</p>}
                </div>
                
                <div>
                    <label className="block">
                        Service No: <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="service_no"
                        value={formData.service_no}
                        onChange={handleChange}
                        className={`border ${errors.service_no ? 'border-red-500' : 'border-gray-300'} rounded px-2 py-1 w-full`}
                    />
                    {errors.service_no && <p className="text-red-500 text-xs mt-1 error-message">{errors.service_no}</p>}
                </div>
                
                <div>
                    <label className="block">Office Business Address:</label>
                    <input
                        type="text"
                        name="office_business_address"
                        value={formData.office_business_address}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>
                
                <div>
                    <label className="block">Unit Assignment:</label>
                    <input
                        type="text"
                        name="unit_assignment"
                        value={formData.unit_assignment}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>
                
                <div>
                    <label className="block">Unit Office Telephone No:</label>
                    <input
                        type="text"
                        name="unit_office_telephone_no"
                        value={formData.unit_office_telephone_no}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>
                
                <div>
                    <label className="block">Occupation Designation:</label>
                    <input
                        type="text"
                        name="occupation_designation"
                        value={formData.occupation_designation}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>
                
                <div>
                    <label className="block">Source of Income:</label>
                    <input
                        type="text"
                        name="source_of_income"
                        value={formData.source_of_income}
                        onChange={handleChange}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                </div>

                {/* Image Upload section with preview */}
                <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">
                        Member Picture <span className="text-red-500">*</span>
                    </label>
                    {previewPicture && (
                        <img
                            src={previewPicture}
                            alt="Preview"
                            className="w-32 h-32 object-cover border mb-2 rounded"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`block w-full ${errors.member_picture ? 'border border-red-500 rounded' : ''}`}
                    />
                    {errors.member_picture && <p className="text-red-500 text-xs mt-1 error-message">{errors.member_picture}</p>}
                </div>

                {/* Signature input with canvas and clear button */}
                <div className="mb-4 md:col-span-2">
                    <label htmlFor="signature" className="block text-sm font-medium">
                        Signature <span className="text-red-500">*</span>
                    </label>
                    <SignatureCanvas
                        ref={signaturePadRef}
                        penColor="black"
                        backgroundColor="rgba(255, 255, 255, 0)"
                        canvasProps={{ 
                            width: 300, 
                            height: 150, 
                            className: `border rounded bg-white ${errors.member_signature ? 'border-red-500' : 'border-gray-300'}` 
                        }}
                        onEnd={handleSignature}
                    />
                    <div className="flex justify-between mt-2">
                        <button
                            type="button"
                            onClick={() => signaturePadRef.current.clear()}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Clear
                        </button>
                    </div>
                    {errors.member_signature && <p className="text-red-500 text-xs mt-1 error-message">{errors.member_signature}</p>}
                </div>

                {/* Submit button */}
                <div className="md:col-span-2">
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal with backdrop */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Update</h3>
                        <p className="mb-6">Are you sure you want to update this member's information?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseConfirmModal}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}