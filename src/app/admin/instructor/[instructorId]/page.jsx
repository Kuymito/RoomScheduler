// /app/admin/instructor/[instructorId]/page.jsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

// --- Data Simulation & Options ---
const initialInstructorData = [
    { id: 1, name: 'Sok Mean', firstName: 'Sok', lastName: 'Mean', email: 'sok.mean@example.com', phone: '012345678', major: 'Computer Science', degree: 'PhD', department:'Faculty of CS', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=68', address : '123 Main St, Phnom Penh, Cambodia', password: 'password123' },
    { id: 2, name: 'Sok Chan', firstName: 'Sok', lastName: 'Chan', email: 'sok.chan@example.com', phone: '012345679', major: 'Information Technology', degree: 'Master', department:'Faculty of IT', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=52', address : '123 Main St, Phnom Penh, Cambodia', password: 'password456' },
    { id: 3, name: 'Dara Kim', firstName: 'Dara', lastName: 'Kim', email: 'dara.kim@example.com', phone: '012345680', major: 'Information Systems', degree: 'Professor', department:'Faculty of IS', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 4, name: 'Lina Heng', firstName: 'Lina', lastName: 'Heng', email: 'lina.heng@example.com', phone: '012345681', majorStudied: 'Artificial Intelligence', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=25', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 5, name: 'Virak Chea', firstName: 'Virak', lastName: 'Chea', email: 'virak.chea@example.com', phone: '012345682', majorStudied: 'Data Science', qualifications: 'Master', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=33', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 6, name: 'Sophea Nov', firstName: 'Sophea', lastName: 'Nov', email: 'sophea.nov@example.com', phone: '012345683', majorStudied: 'Machine Learning', qualifications: 'Lecturer', status: 'active', profileImage: null, address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' }, // No image
    { id: 7, name: 'Chanthy Pen', firstName: 'Chanthy', lastName: 'Pen', email: 'chanthy.pen@example.com', phone: '012345684', majorStudied: 'Data Analytics', qualifications: 'Associate Professor', status: 'active', profileImage: 'https://i.pravatar.cc/150?img=17', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
    { id: 8, name: 'Vicheka Sreng', firstName: 'Vicheka', lastName: 'Sreng', email: 'vicheka.sreng@example.com', phone: '012345685', majorStudied: 'Software Engineering', qualifications: 'PhD', status: 'archived', profileImage: 'https://i.pravatar.cc/150?img=41', address : '123 Main St, Phnom Penh, Cambodia', password: 'password789' },
];

const majorOptions = ['Computer Science', 'Information Technology', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics', 'Robotics'];
const degreeOptions = ['Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'];
const departmentOptions = ['Faculty of CS', 'Faculty of IT', 'Faculty of IS', 'Faculty of SE', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of Robotics'];

const DefaultAvatarIcon = ({ className = "w-24 h-24" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-500 p-1`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

// --- Icon Components ---
const EyeOpenIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeClosedIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
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
    const [successMessage, setSuccessMessage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // --- State for password fields ---
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

    // --- API Simulation Functions ---
    const fetchInstructorDetails = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = initialInstructorData.find(inst => inst.id === id);
            if (data) {
                setInstructorDetails(data);
                setEditableInstructorDetails({ ...data });
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

    const saveGeneralInfo = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            const updatedDetails = { ...editableInstructorDetails, profileImage: imagePreviewUrl };
            setInstructorDetails(updatedDetails);
            setEditableInstructorDetails({ ...updatedDetails });
            setIsEditingGeneral(false);
            setSuccessMessage("General information updated successfully!");
        } catch (err) {
            setError(`Error saving general info: ${err.message}`);
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
            await new Promise(resolve => setTimeout(resolve, 700));
            const updatedDetails = { ...instructorDetails, password: newPassword };
            setInstructorDetails(updatedDetails);
            setEditableInstructorDetails({ ...updatedDetails });

            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setSuccessMessage("Password updated successfully!");
        } catch (err) {
            setError(`Error changing password: ${err.message}`);
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
        if (!isEditingGeneral || !editableInstructorDetails) return;
        setEditableInstructorDetails(prev => ({
            ...prev,
            name: `${prev.firstName || ''} ${prev.lastName || ''}`.trim()
        }));
    }, [editableInstructorDetails?.firstName, editableInstructorDetails?.lastName, isEditingGeneral]);

    // --- UI Handlers ---
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

    const handleSaveClick = (section) => {
        if (section === 'general') {
            saveGeneralInfo();
        } else if (section === 'password') {
            savePassword();
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
                if (!isEditingGeneral) {
                    setIsEditingGeneral(true);
                }
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

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        if (emptyPasswordError.new) {
            setEmptyPasswordError(prev => ({ ...prev, new: false }));
            setError(null);
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
        if (passwordMismatchError) {
            setPasswordMismatchError(false);
            setError(null);
        }
        if (emptyPasswordError.confirm) {
            setEmptyPasswordError(prev => ({ ...prev, confirm: false }));
            setError(null);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // --- Render Logic ---
    if (loading && !instructorDetails) {
        return (
            // A centered spinner, with height calculated to fit within your layout
            <div className="flex justify-center items-center h-[calc(100vh-200px)] dark:text-gray-200">
                <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-300">Loading instructor detail...</span>
            </div>
        );
    }
    // --- REMOVED PROBLEMATIC LINE --- 
    if (!instructorDetails) return <div className="p-6 text-red-500">Instructor not found.</div>;;

    const currentData = isEditingGeneral ? editableInstructorDetails : instructorDetails;

    // --- Reusable Field Rendering Functions ---
    const renderTextField = (label, name, value, isEditing, opts = {}) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <input
                type={opts.type || "text"}
                name={name}
                value={value || ''}
                placeholder={opts.placeholder || label}
                onChange={handleInputChange}
                readOnly={!isEditing}
                disabled={loading}
                className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-num-dark-text dark:text-white ${!isEditing ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-num-content-bg dark:bg-gray-700 border-num-gray-light dark:border-gray-600'}`}
            />
        </div>
    );
    
    const renderSelectField = (label, name, value, options, isEditing) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            {isEditing ? (
                <select name={name} value={value} onChange={handleInputChange} disabled={loading} className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-num-dark-text dark:text-white">
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            ) : (
                <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400" />
            )}
        </div>
    );
    
    const renderPasswordField = (label, name, value, onChange, fieldName, hasError = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 ${
                        hasError || emptyPasswordError[fieldName]
                        ? 'border-red-500 ring-1 ring-red-500' 
                        : 'border-num-gray-light dark:border-gray-600'
                    }`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={onChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                />
                {isEditingPassword && (
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility(fieldName)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        aria-label={passwordVisibility[fieldName] ? "Hide password" : "Show password"}
                    >
                        {passwordVisibility[fieldName] ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
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
                            {isEditingGeneral ? (
                                <>
                                    <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => handleSaveClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
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
                                        value={instructorDetails.password}
                                        className="form-input w-full py-2 px-3  bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
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
                            {renderPasswordField("New Password", "newPassword", newPassword, handleNewPasswordChange, "new")}
                        </div>
                        <div className="form-row flex gap-3 mb-2 flex-wrap">
                            {renderPasswordField(
                                "Confirm New Password", 
                                "confirmNewPassword", 
                                confirmNewPassword, 
                                handleConfirmPasswordChange, 
                                "confirm", 
                                passwordMismatchError
                            )}
                        </div>
                        
                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingPassword ? (
                                <>
                                    <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => handleSaveClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button>
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