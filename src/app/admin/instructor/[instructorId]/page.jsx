// /app/admin/instructor/[instructorId]/page.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

// --- Data Simulation & Options ---
// In a real app, this data would come from your database via an API.
const initialInstructorData = [
    { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', majorStudied: 'Computer Science', qualifications: 'PhD', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68' },
    { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', majorStudied: 'Information Technology', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52' },
    { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', majorStudied: 'Information Systems', qualifications: 'Professor', status: 'active', profileImage: null }, // No image
    { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', majorStudied: 'Artificial Intelligence', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25' },
    { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', majorStudied: 'Data Science', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33' },
    { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', majorStudied: 'Machine Learning', qualifications: 'Lecturer', status: 'active', profileImage: null }, // No image
    { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', majorStudied: 'Data Analytics', qualifications: 'Associate Professor', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17' },
    { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', majorStudied: 'Software Engineering', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41' },
];

const majorStudiedOptions = ['Computer Science', 'Information Technology', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics', 'Robotics'];
const qualificationsOptions = ['Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'];

// A default icon for when an instructor has no profile image
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
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // --- API Simulation Functions ---
    const fetchInstructorDetails = async (id) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = initialInstructorData.find(inst => inst.id === id);
            if (data) {
                setInstructorDetails(data);
            } else {
                setError('Instructor not found.');
            }
        } catch (err) {
            setError("Failed to load instructor details.");
        } finally {
            setLoading(false);
        }
    };

    const saveInstructorDetails = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            setInstructorDetails(editableInstructorDetails);
            setIsEditing(false);
            setSuccessMessage("Instructor details updated successfully!");
        } catch (err) {
            setError("Failed to save instructor details.");
        } finally {
            setLoading(false);
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
        // Auto-update the full name whenever first or last name changes in edit mode
        if (!isEditing || !editableInstructorDetails) {
            return;
        }
        setEditableInstructorDetails(prev => ({
            ...prev,
            name: `${prev.firstName} ${prev.lastName}`
        }));
    }, [editableInstructorDetails?.firstName, editableInstructorDetails?.lastName, isEditing]);

    // --- UI Handlers ---
    const handleEditToggle = () => {
        if (isEditing) {
            saveInstructorDetails();
        } else {
            setIsEditing(true);
            const currentDetails = { ...instructorDetails };
            setEditableInstructorDetails(currentDetails);
            setImagePreviewUrl(currentDetails.profileImage || null);
            setSuccessMessage(null);
            setError(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result); // For UI preview
                setEditableInstructorDetails(prev => ({ ...prev, profileImage: reader.result })); // For saving
            };
            reader.readAsDataURL(file);
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableInstructorDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteImage = () => {
        setImagePreviewUrl(null); // Clear the visual preview
        setEditableInstructorDetails(prev => ({ ...prev, profileImage: null })); // Set profileImage to null in the data to be saved
        if (fileInputRef.current) {
            fileInputRef.current.value = null; // Reset the file input field to allow re-uploading the same file if needed
        }
    };

    const fileInputRef = useRef(null); 

    // --- Render Logic ---
    if (loading && !instructorDetails) { return <div className="p-6 dark:text-white">Loading instructor details...</div>; }
    if (!instructorDetails) { return <div className="p-6 text-red-500 dark:text-red-400">Error: {error}</div>; }
    if (isEditing && !editableInstructorDetails) { return null; }

    const currentData = isEditing ? editableInstructorDetails : instructorDetails;

    const renderTextField = (label, name, value, type = "text") => (
        <div className="form-group flex-1 min-w-[200px]">
           <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
           <input type={type} name={name} value={value} onChange={handleInputChange} readOnly={!isEditing} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white" />
       </div>
   );

    const renderSelectField = (label, name, value, options) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
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
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Instructor Profile</div>
            <hr className="border-t border-gray-200 mt-4 mb-8" />
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                {/* Left Column: Overview & Photo Upload - Adjusted to match Avatar.png */}
                <div className="overview-card w-full h-min sm:w-auto md:w-[300px] p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-md rounded-lg flex-shrink-0">
                    {!isEditing ? (
                        // --- VIEW MODE ---
                        <div className="flex items-center gap-4">
                            <div className="relative mb-4">
                                {currentData.profileImage ? (
                                    <Image 
                                        src={currentData.profileImage} 
                                        alt={`${currentData.name}'s profile`} 
                                        width={96} 
                                        height={96} 
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
                                    />
                                ) : (
                                    <DefaultAvatarIcon className="w-24 h-24 rounded-full" />
                                )}
                                {instructorDetails && ( // Status dot
                                    <span
                                        className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${instructorDetails.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                                        title={`Status: ${instructorDetails.status}`}
                                    ></span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                            </div>
                        </div>
                    ) : (
                        // --- EDIT MODE ---
                        // This entire block is now styled like your InstructorCreatePopup's image section
                        <div>
                            <div className="flex flex-col gap-4"> {/* Centering items */}
                                <div className='flex flex-row items-center gap-4 mb-4'>
                                    {imagePreviewUrl ? (
                                        <img
                                            src={imagePreviewUrl}
                                            alt="Profile Preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div >
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-col items-center gap-2 w-full"> {/* Container for buttons */}
                                        <button
                                            type="button"
                                            onClick={handleButtonClick} // Use the wrapper function
                                            className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                                        >
                                            {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'}
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    id="profileImage" // Keep id for accessibility if label were used
                                    name="profileImage"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="sr-only"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Details Wrapper */}
                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("First Name", "firstName", currentData.firstName)}
                            {renderTextField("Last Name", "lastName", currentData.lastName)}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderTextField("Email", "email", currentData.email, "email")}
                            {renderTextField("Phone Number", "phone", currentData.phone, "tel")}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                             {renderSelectField("Major Studied", "majorStudied", currentData.majorStudied, majorStudiedOptions)}
                             {renderSelectField("Qualifications", "qualifications", currentData.qualifications, qualificationsOptions)}
                        </div>
                        
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                               Back
                           </button>
                           <button onClick={handleEditToggle} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer" disabled={loading}>
                               {loading && isEditing ? "Saving..." : isEditing ? "Save Changes" : "Edit Instructor"}
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