// /app/admin/instructor/[instructorId]/page.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';
import InstructorDetailSkeleton from '../components/InstructorDetailSkeleton';

const API_BASE_URL = 'https://jaybird-new-previously.ngrok-free.app/api/v1';

// --- Icon Components ---
const DefaultAvatarIcon = ({ className = "w-24 h-24" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

const InstructorDetailsContent = () => {
    // --- State Variables ---
    const router = useRouter();
    const params = useParams();
    const [instructorDetails, setInstructorDetails] = useState(null);
    const [editableInstructorDetails, setEditableInstructorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [emptyPasswordError, setEmptyPasswordError] = useState({
        new: false,
        confirm: false
    });
    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Static options for dropdowns
    const majorOptions = ['Computer Science', 'Information Technology', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics', 'Robotics'];
    const degreeOptions = ['Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'];
    const departmentOptions = ['Faculty of CS', 'Faculty of IT', 'Faculty of IS', 'Faculty of SE', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of Robotics'];

    const fetchInstructorDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    router.push('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const instructor = data.payload;
            
            // Format the instructor data
            const formattedInstructor = {
                id: instructor.instructorId,
                instructorId: instructor.instructorId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                name: `${instructor.firstName} ${instructor.lastName}`,
                email: instructor.email,
                phone: instructor.phone,
                degree: instructor.degree,
                major: instructor.major,
                department: instructor.departmentName,
                profileImage: instructor.profile,
                archived: instructor.archived,
                status: instructor.archived ? 'archived' : 'active',
                address: instructor.address,
                password: '********' // Placeholder for password
            };

            setInstructorDetails(formattedInstructor);
            setEditableInstructorDetails({ ...formattedInstructor });
            setImagePreviewUrl(instructor.profile || null);
        } catch (error) {
            setError(error.message || "Failed to fetch instructor details");
            console.error("Error fetching instructor details:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveGeneralInfo = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`${API_BASE_URL}/instructors/${instructorDetails.instructorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    firstName: editableInstructorDetails.firstName,
                    lastName: editableInstructorDetails.lastName,
                    email: editableInstructorDetails.email,
                    phone: editableInstructorDetails.phone,
                    degree: editableInstructorDetails.degree,
                    major: editableInstructorDetails.major,
                    departmentName: editableInstructorDetails.department,
                    address: editableInstructorDetails.address,
                    profile: imagePreviewUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update instructor');
            }

            await fetchInstructorDetails(instructorDetails.instructorId);
            setIsEditingGeneral(false);
            setSuccessMessage("General information updated successfully!");
        } catch (error) {
            setError(error.message || "Failed to update instructor");
        } finally {
            setLoading(false);
        }
    };

    const savePassword = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPasswordMismatchError(false);
        setEmptyPasswordError({ new: false, confirm: false });

        const isNewPasswordEmpty = !newPassword;
        const isConfirmPasswordEmpty = !confirmNewPassword;

        if (isNewPasswordEmpty || isConfirmPasswordEmpty) {
            setError("New and confirm password fields are required.");
            setEmptyPasswordError({
                new: isNewPasswordEmpty,
                confirm: isConfirmPasswordEmpty,
            });
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            setPasswordMismatchError(true);
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`${API_BASE_URL}/instructors/${instructorDetails.instructorId}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    newPassword: newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setSuccessMessage("Password updated successfully!");
        } catch (error) {
            setError(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    // --- Hooks ---
    useEffect(() => {
        const instructorIdFromUrl = params.instructorId;
        if (instructorIdFromUrl) {
            fetchInstructorDetails(instructorIdFromUrl);
        }
    }, [params.instructorId]);

    // --- Handlers ---
    const handleEditClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableInstructorDetails({ ...instructorDetails });
            setImagePreviewUrl(instructorDetails.profileImage);
            setIsEditingGeneral(true);
        } else if (section === 'password') {
            setIsEditingPassword(true);
        }
    };

    const handleCancelClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableInstructorDetails({ ...instructorDetails });
            setImagePreviewUrl(instructorDetails.profileImage);
            setIsEditingGeneral(false);
        } else if (section === 'password') {
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ new: false, confirm: false });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
                if (!isEditingGeneral) {
                    setIsEditingGeneral(true);
                }
                setIsUploading(false);
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

    // ... rest of the handlers remain the same ...

    // --- Render Logic ---
    if (loading && !instructorDetails) {
        return <InstructorDetailSkeleton />;
    }

    if (!instructorDetails) return <div className="p-6 text-red-500">Instructor not found.</div>;

    const currentData = isEditingGeneral ? editableInstructorDetails : instructorDetails;

    // ... rest of the component remains the same ...

    return (
        <div className='p-6 dark:text-white'>
            {/* Error and success messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg className="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                        </svg>
                    </button>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Success: </strong>
                    <span className="block sm:inline">{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg className="fill-current h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                        </svg>
                    </button>
                </div>
            )}

            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Instructor Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />

            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
                    <div className="avatar-content flex relative">
                        {imagePreviewUrl ? (
                            <Image src={imagePreviewUrl} alt="Profile Preview" width={56} height={56} className="avatar-img w-14 h-14 rounded-full mr-3 object-cover" />
                        ) : (
                            <DefaultAvatarIcon className="avatar-img w-14 h-14 rounded-full mr-3" />
                        )}
                        <span className={`avatar-img absolute left-[42px] bottom-[20px] block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${instructorDetails.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} title={`Status: ${instructorDetails.status}`}></span>
                        <div className='avatar-info flex flex-col'>
                            <div className='avatar-name font-semibold text-lg text-black dark:text-white mb-0.5'>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{currentData.name}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleUploadButtonClick}
                                disabled={isUploading}
                                className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
                        </div>
                    </div>
                </div>

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">General Information</div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={currentData.firstName || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditingGeneral}
                                    disabled={loading}
                                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
                                />
                            </div>
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={currentData.lastName || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditingGeneral}
                                    disabled={loading}
                                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
                                />
                            </div>
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={currentData.email || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditingGeneral}
                                    disabled={loading}
                                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
                                />
                            </div>
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={currentData.phone || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditingGeneral}
                                    disabled={loading}
                                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
                                />
                            </div>
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Major</label>
                                {isEditingGeneral ? (
                                    <select 
                                        name="major" 
                                        value={currentData.major || ''} 
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"
                                    >
                                        {majorOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={currentData.major || ''} 
                                        readOnly 
                                        className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400" 
                                    />
                                )}
                            </div>
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Degree</label>
                                {isEditingGeneral ? (
                                    <select 
                                        name="degree" 
                                        value={currentData.degree || ''} 
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"
                                    >
                                        {degreeOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={currentData.degree || ''} 
                                        readOnly 
                                        className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400" 
                                    />
                                )}
                            </div>
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Department</label>
                                {isEditingGeneral ? (
                                    <select 
                                        name="department" 
                                        value={currentData.department || ''} 
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white"
                                    >
                                        {departmentOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={currentData.department || ''} 
                                        readOnly 
                                        className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400" 
                                    />
                                )}
                            </div>
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={currentData.address || ''}
                                    onChange={handleInputChange}
                                    readOnly={!isEditingGeneral}
                                    disabled={loading}
                                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
                                />
                            </div>
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingGeneral ? (
                                <>
                                    <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => saveGeneralInfo()} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                        Back
                                    </button>
                                    <button onClick={() => handleEditClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Edit Profile</button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                        <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">Password information</div>
                        
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.current ? "text" : "password"}
                                        readOnly
                                        value={instructorDetails.password || ''}
                                        className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                        aria-label={passwordVisibility.current ? "Hide password" : "Show password"}
                                    >
                                        {passwordVisibility.current ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.new ? "text" : "password"}
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (emptyPasswordError.new) {
                                                setEmptyPasswordError(prev => ({ ...prev, new: false }));
                                            }
                                        }}
                                        readOnly={!isEditingPassword}
                                        disabled={loading}
                                        className={`form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 ${
                                            emptyPasswordError.new ? 'border-red-500 ring-1 ring-red-500' : 'border-num-gray-light dark:border-gray-600'
                                        }`}
                                        placeholder="Enter new password"
                                    />
                                    {isEditingPassword && (
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            aria-label={passwordVisibility.new ? "Hide password" : "Show password"}
                                        >
                                            {passwordVisibility.new ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            <div className="form-group flex-1 min-w-[200px]">
                                <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisibility.confirm ? "text" : "password"}
                                        name="confirmNewPassword"
                                        value={confirmNewPassword}
                                        onChange={(e) => {
                                            setConfirmNewPassword(e.target.value);
                                            if (passwordMismatchError) {
                                                setPasswordMismatchError(false);
                                            }
                                            if (emptyPasswordError.confirm) {
                                                setEmptyPasswordError(prev => ({ ...prev, confirm: false }));
                                            }
                                        }}
                                        readOnly={!isEditingPassword}
                                        disabled={loading}
                                        className={`form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 ${
                                            passwordMismatchError || emptyPasswordError.confirm ? 'border-red-500 ring-1 ring-red-500' : 'border-num-gray-light dark:border-gray-600'
                                        }`}
                                        placeholder="Confirm new password"
                                    />
                                    {isEditingPassword && (
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                            aria-label={passwordVisibility.confirm ? "Hide password" : "Show password"}
                                        >
                                            {passwordVisibility.confirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </button>
                                    )}
                                </div>
                                {passwordMismatchError && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingPassword ? (
                                <>
                                    <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => savePassword()} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => router.back()} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>
                                        Back
                                    </button>
                                    <button onClick={() => handleEditClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Change Password</button>
                                </>
                            )}
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