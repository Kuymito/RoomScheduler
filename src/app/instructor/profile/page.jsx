'use client';

import { useState, useEffect, useRef } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { authService } from '@/services/auth.service';

// --- Icon Components ---
const EyeOpenIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> );
const EyeClosedIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> );
const defaultUserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const ProfileContentSkeleton = () => (
    <div className='p-6 animate-pulse'>
        <div className="h-7 w-24 bg-slate-300 dark:bg-slate-600 rounded mb-4"></div>
        <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
        <div className="profile-section flex gap-8 mb-4 flex-wrap">
            <div className="avatar-card w-[220px] p-3 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg flex-shrink-0 self-start">
                <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-600 mr-3"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                    </div>
                </div>
                 <div className="h-9 mt-3 bg-slate-300 dark:bg-slate-600 rounded-md"></div>
            </div>
            <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                <div className="info-card p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg space-y-4">
                     <div className="h-5 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-3"></div>
                     <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
                     <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
                     <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
                </div>
                <div className="info-card p-4 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg space-y-4">
                     <div className="h-5 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-3"></div>
                     <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
                     <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
                </div>
            </div>
        </div>
    </div>
);

const fetcher = ([, token]) => authService.getProfile(token);

const ProfileContent = () => {
    const { data: session, status: sessionStatus } = useSession();
    
    const { data: profileResponse, error: profileError } = useSWR(
        session?.accessToken ? ['/api/profile', session.accessToken] : null,
        fetcher
    );
    
    const [profileData, setProfileData] = useState(null);
    const [editableProfileData, setEditableProfileData] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [emptyPasswordError, setEmptyPasswordError] = useState({ new: false, confirm: false, current: false });
    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (profileResponse) {
             const initialData = {
                firstName: profileResponse.firstName || "NA",
                lastName: profileResponse.lastName || "NA",
                email: profileResponse.email || "NA",
                phoneNumber: profileResponse.phone || "NA",
                address: profileResponse.address || "NA",
                avatarUrl: profileResponse.profile,
                password: profileResponse.password || "N/A",
                degree: profileResponse.degree || "N/A",
                department: profileResponse.departmentName || "N/A",
                major: profileResponse.major || "N/A",
            };
            setProfileData(initialData);
            setEditableProfileData(initialData);
            setImagePreviewUrl(initialData.avatarUrl);
        }
    }, [profileResponse]);

    const handleGeneralInputChange = (e) => {
        const { name, value } = e.target;
        setEditableProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUploadButtonClick = () => fileInputRef.current?.click();

    const handleEditClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableProfileData({ ...profileData });
            setIsEditingGeneral(true);
        } else if (section === 'password') {
            setIsEditingPassword(true);
        }
    };

    const handleCancelClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableProfileData({ ...profileData });
            setImagePreviewUrl(profileData.avatarUrl);
            setIsEditingGeneral(false);
        } else if (section === 'password') {
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ current: false, new: false, confirm: false });
        }
    };

    const handleSaveClick = (section) => {
        if(section === 'general') {
             console.log("Saving general info:", editableProfileData);
             setProfileData({ ...editableProfileData });
             setIsEditingGeneral(false);
        } else {
            console.log("Saving password...");
            setIsEditingPassword(false);
        }
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmNewPassword(e.target.value);
    };

    const handleCurrentPasswordChange = (e) => {
        setCurrentPassword(e.target.value);
    };

    const togglePasswordVisibility = (field) => { setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] })) };

    const renderPasswordField = (label, name, value, onChange, fieldName, isReadOnly = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800 border-num-gray-light dark:border-gray-700 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-700 border-num-gray-light dark:border-gray-600 text-num-dark-text dark:text-white'}`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={onChange}
                    readOnly={isReadOnly}
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => togglePasswordVisibility(fieldName)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={passwordVisibility[fieldName] ? "Hide password" : "Show password"}
                >
                    {passwordVisibility[fieldName] ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
            </div>
        </div>
    );
    

    if (sessionStatus === 'loading' || !profileData) {
        return <ProfileContentSkeleton />;
    }

    if (profileError) {
        return <div className="p-6 text-red-500 text-center">Error loading profile: {profileError.message}</div>
    }

    const currentDisplayData = isEditingGeneral ? editableProfileData : profileData;

    return (
        <div className="p-6">
            <div className="section-title font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                Profile
            </div>
            <hr className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-8" />
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                <div className="avatar-card w-[220px] p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg flex-shrink-0 self-start">
                    <div className="avatar-content flex items-center">
                        {imagePreviewUrl ? (
                            <Image
                                src={imagePreviewUrl}
                                alt="Profile Avatar"
                                width={56}
                                height={56}
                                className="avatar-img w-14 h-14 rounded-full mr-3 object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full mr-3 flex items-center justify-center">
                            {defaultUserIcon({className: "h-34 w-34 text-gray-700 dark:text-gray-400"})}
                            </div>
                        )}
                        <div className="avatar-info flex flex-col">
                            <div className="avatar-name font-semibold text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                                Dr.{" "}
                                {currentDisplayData.firstName} {currentDisplayData.lastName}
                            </div>
                            <div className="avatar-role font-semibold text-xs text-gray-500 dark:text-gray-400">
                                Instructor
                            </div>
                        </div>
                    </div>
                     <button
                        type="button"
                        onClick={handleUploadButtonClick}
                        disabled={isUploading || !isEditingGeneral}
                        className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Uploading..." : "Upload Picture"}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="sr-only" />
                </div>

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
                        <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                            General Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input type="text" name="firstName" value={currentDisplayData.firstName} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input type="text" name="lastName" value={currentDisplayData.lastName} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" name="email" value={currentDisplayData.email} readOnly className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs bg-gray-100 dark:bg-gray-700`} />
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={currentDisplayData.phoneNumber} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                             <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Degree</label>
                                <input type="text" name="degree" value={currentDisplayData.degree} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                             <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Major</label>
                                <input type="text" name="major" value={currentDisplayData.major} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                             <div className="form-group md:col-span-2">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                <input type="text" name="department" value={currentDisplayData.department} onChange={handleGeneralInputChange} readOnly={!isEditingGeneral} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneral ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`} />
                            </div>
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingGeneral ? (
                                <>
                                    <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white py-2 px-3 font-semibold text-xs">Cancel</button>
                                    <button onClick={() => handleSaveClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white text-xs py-2 px-3 font-semibold">Save Changes</button>
                                </>
                            ) : (
                                <button onClick={() => handleEditClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white py-2 px-3 font-semibold text-xs">Edit Profile</button>
                            )}
                        </div>
                    </div>

                    <div className="info-card-password p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
                        <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">Password Information</div>
                        <div className="space-y-4">
                            <div className="flex gap-3 flex-wrap">
                                {renderPasswordField("Current Password", "currentPassword", isEditingPassword ? currentPassword : profileData.password, handleCurrentPasswordChange, "current", !isEditingPassword)}
                                {renderPasswordField("New Password", "newPassword", newPassword, handleNewPasswordChange, "new", !isEditingPassword)}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {renderPasswordField("Confirm New Password", "confirmNewPassword", confirmNewPassword, handleConfirmPasswordChange, "confirm", !isEditingPassword || passwordMismatchError)}
                            </div>
                        </div>
                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
                             {isEditingPassword ? (
                                <>
                                    <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-custom-light rounded-md text-gray-800 dark:text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Cancel</button>
                                    <button onClick={() => handleSaveClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>{loading ? "Saving..." : "Save Password"}</button>
                                </>
                            ) : (
                                <button onClick={() => handleEditClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer" disabled={loading}>Change Password</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InstructorProfilePage() {
    return (
        <InstructorLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </InstructorLayout>
    );
}