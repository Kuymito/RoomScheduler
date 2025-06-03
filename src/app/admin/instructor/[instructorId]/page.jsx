// /app/admin/instructor/[instructorId]/page.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

// --- Data Simulation & Options ---
const initialInstructorData = [
    { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', major: 'Computer Science', degree: 'PhD', department:'Faculty of CS', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', major: 'Information Technology', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', major: 'Information Systems', degree: 'Professor', department:'Faculty of IS', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', major: 'Artificial Intelligence', degree: 'PhD', department:'Faculty of AI', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', major: 'Data Science', degree: 'Master', department:'Faculty of DS', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', major: 'Machine Learning', degree: 'Lecturer', department:'Faculty of ML', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', major: 'Data Analytics', degree: 'Associate Professor', department:'Faculty of DA', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', major: 'Software Engineering', degree: 'PhD', department:'Faculty of SE', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
];

const majorOptions = ['Computer Science', 'Information Technology', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics', 'Robotics'];
const degreeOptions = ['Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'];
const departmentOptions = ['Faculty of CS', 'Faculty of IT', 'Faculty of IS', 'Faculty of SE', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of Robotics'];

const DefaultAvatarIcon = ({ className = "w-24 h-24" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);


const InstructorDetailsContent = () => {
    const router = useRouter();
    const params = useParams();

    const [instructorDetails, setInstructorDetails] = useState(null);
    const [editableInstructorDetails, setEditableInstructorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const fileInputRef = useRef(null);

    // --- API Simulation Functions ---
    const fetchInstructorDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = initialInstructorData.find(inst => inst.id === id);
            if (data) {
                setInstructorDetails(data);
                setEditableInstructorDetails(data);
                setImagePreviewUrl(data.profileImage || null);
            } else {
                setError('Instructor not found.');
            }
        } catch (err) {
            setError("Failed to load instructor details.");
        } finally {
            setLoading(false);
        }
    };

    const saveSection = async (section) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            setInstructorDetails(editableInstructorDetails);
            if (section === 'general') setIsEditingGeneral(false);
            if (section === 'password') setIsEditingPassword(false);
        } catch (err) {
            setError("Failed to save instructor details.");
        } finally {
            setLoading(false);
        }
    };
    
    const saveProfileImage = async (newImage) => {
        setIsUploading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updatedDetails = { ...instructorDetails, profileImage: newImage };
            setInstructorDetails(updatedDetails);
            setEditableInstructorDetails(updatedDetails);
        } catch (err) {
            setError("Failed to save the new image.");
            setImagePreviewUrl(instructorDetails.profileImage); // Revert on failure
        } finally {
            setIsUploading(false);
        }
    };

    // --- Hooks ---
    useEffect(() => {
        const instructorIdFromUrl = params.instructorId;
        if (instructorIdFromUrl) {
            fetchInstructorDetails(parseInt(instructorIdFromUrl, 10));
        }
    }, [params.instructorId]);

    useEffect(() => {
        if (!editableInstructorDetails || (!isEditingGeneral && !isEditingPassword)) return;
        setEditableInstructorDetails(prev => ({
            ...prev,
            name: `${prev.firstName} ${prev.lastName}`.trim()
        }));
    }, [editableInstructorDetails?.firstName, editableInstructorDetails?.lastName, isEditingGeneral, isEditingPassword]);

    // --- UI Handlers ---
    const handleEditToggle = (section, isEditing) => {
        setEditableInstructorDetails({ ...instructorDetails });
        setError(null);
        if (section === 'general') setIsEditingGeneral(isEditing);
        if (section === 'password') setIsEditingPassword(isEditing);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                setImagePreviewUrl(result);
                saveProfileImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableInstructorDetails(prev => ({ ...prev, [name]: value }));
    };

    // --- Render Logic ---
    if (loading && !instructorDetails) return <div className="p-6 dark:text-white">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!instructorDetails) return null;

    const currentData = isEditingGeneral || isEditingPassword ? editableInstructorDetails : instructorDetails;

    const renderTextField = (label, name, value, isEditingSection, opts = {}) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            <input
                type={opts.type || "text"}
                name={name}
                value={value || ''}
                placeholder={opts.placeholder || label}
                onChange={handleInputChange}
                readOnly={!isEditingSection}
                disabled={loading}
                className={`form-input w-full py-2 px-3 border rounded-md font-medium text-[14px] text-num-dark-text dark:text-white ${!isEditingSection ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
            />
        </div>
    );

    const renderSelectField = (label, name, value, options, isEditingSection) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditingSection ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white">
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-[14px] text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Instructor Details</div>
            <hr className="border-t border-gray-200 mt-4 mb-8" />
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                {/* Profile Card */}
                <div className="overview-card w-full h-min sm:w-auto md:w-[300px] p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg flex-shrink-0">
                    <div className="flex flex-col gap-4">
                        <div className='relative flex flex-row items-center gap-4'>
                            {imagePreviewUrl ? (
                                <Image src={imagePreviewUrl} alt="Profile Preview" width={96} height={96} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md" />
                            ) : (
                                <DefaultAvatarIcon className="w-24 h-24 rounded-full" />
                            )}
                            <span className={`absolute bottom-1 left-[72px] block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${instructorDetails.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={`Status: ${instructorDetails.status}`}></span>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                            </div>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleUploadButtonClick}
                                disabled={isUploading}
                                className="w-full rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
                        </div>
                    </div>
                </div>

                {/* Information Cards Wrapper */}
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    {/* General Information Card */}
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("First Name", "firstName", currentData.firstName, isEditingGeneral)}
                            {renderTextField("Last Name", "lastName", currentData.lastName, isEditingGeneral)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Email", "email", currentData.email, isEditingGeneral, { type: 'email' })}
                            {renderTextField("Phone Number", "phone", currentData.phone, isEditingGeneral, { type: 'tel' })}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Major", "major", currentData.major, majorOptions, isEditingGeneral)}
                            {renderSelectField("Degree", "degree", currentData.degree, degreeOptions, isEditingGeneral)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderSelectField("Department", "department", currentData.department, departmentOptions, isEditingGeneral)}
                            {renderTextField("Address", "address", currentData.address, isEditingGeneral)}
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            <button onClick={() => isEditingGeneral ? handleEditToggle('general', false) : router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                {isEditingGeneral ? 'Cancel' : 'Back'}
                            </button>
                            <button onClick={() => isEditingGeneral ? saveSection('general') : handleEditToggle('general', true)} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                {loading && isEditingGeneral ? "Saving..." : isEditingGeneral ? "Save Changes" : "Edit Info"}
                            </button>
                        </div>
                    </div>

                    {/* Password Card */}
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">Password</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("New Password", "newPassword", currentData.newPassword, isEditingPassword, { type: 'password', placeholder: 'Enter new password' })}
                            {renderTextField("Confirm Password", "confirmPassword", currentData.confirmPassword, isEditingPassword, { type: 'password', placeholder: 'Confirm new password' })}
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            <button onClick={() => isEditingPassword ? handleEditToggle('password', false) : router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                {isEditingPassword ? 'Cancel' : 'Back'}
                            </button>
                            <button onClick={() => isEditingPassword ? saveSection('password') : handleEditToggle('password', true)} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                                {loading && isEditingPassword ? "Saving..." : isEditingPassword ? "Save Changes" : "Edit Password"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function InstructorDetailsPage() {
    return (
        <AdminLayout activeItem="instructor" pageTitle="Instructor Details">
            <InstructorDetailsContent />
        </AdminLayout>
    );
}