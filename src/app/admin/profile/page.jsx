'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Using AdminLayout
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { authService } from '@/services/auth.service'; // Renamed for consistency
import SuccessPopup from '@/app/admin/profile/components/SuccessPopup';
import PasswordConfirmationModal from '@/components/PasswordConfirmationModal';

// --- Icon Components ---
const EyeOpenIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> );
const EyeClosedIcon = ({ className = "h-5 w-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> );
const DefaultUserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

// --- Skeleton Component ---
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

const profileFetcher = ([, token]) => authService.getProfile(token);

function ProfileContent() {
    const { data: sessionData, status: sessionStatus } = useSession();
    const { data: profileResponse, error: profileFetchError, mutate: mutateProfileData } = useSWR(
        sessionData?.accessToken ? ['/api/profile', sessionData.accessToken] : null,
        profileFetcher
    );

    const [profileState, setProfileState] = useState(null);
    const [editableProfileState, setEditableProfileState] = useState(null);
    const [imagePreviewURL, setImagePreviewURL] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputReference = useRef(null);
    const [isEditingGeneralInformation, setIsEditingGeneralInformation] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPasswordValue, setNewPasswordValue] = useState('');
    const [confirmNewPasswordValue, setConfirmNewPasswordValue] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);
    const [emptyPasswordError, setEmptyPasswordError] = useState({ new: false, confirm: false });
    const [passwordVisibility, setPasswordVisibility] = useState({ new: false, confirm: false });
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [modalErrorMessage, setModalErrorMessage] = useState(null);

    useEffect(() => {
        if (profileResponse) {
             const initialProfileData = {
                firstName: profileResponse.firstName || "Not Available",
                lastName: profileResponse.lastName || "Not Available",
                email: profileResponse.email || "Not Available",
                phoneNumber: profileResponse.phone || "Not Available",
                address: profileResponse.address || "Not Available",
                avatarUrl: profileResponse.profile,
             };
            setProfileState(initialProfileData);
            setEditableProfileState(initialProfileData);
            setImagePreviewURL(initialProfileData.avatarUrl);
        }
    }, [profileResponse]);

    const handleGeneralInputChange = (event) => {
        const { name, value } = event.target;
        setEditableProfileState(previousState => ({ ...previousState, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreviewURL(URL.createObjectURL(file));
        }
    };

    const handleUploadButtonClick = () => fileInputReference.current?.click();

    const handleEditClick = (section) => {
        setErrorMessage(null);
        setModalErrorMessage(null);
        if (section === 'general') {
            setEditableProfileState({ ...profileState });
            setIsEditingGeneralInformation(true);
        } else if (section === 'password') {
            setIsEditingPassword(true);
        }
    };

    const handleCancelClick = (section) => {
        setErrorMessage(null);
        setModalErrorMessage(null);
        if (section === 'general') {
            setEditableProfileState({ ...profileState });
            setImagePreviewURL(profileState.avatarUrl);
            setIsEditingGeneralInformation(false);
            setSelectedFile(null);
        } else if (section === 'password') {
            setNewPasswordValue('');
            setConfirmNewPasswordValue('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ new: false, confirm: false });
        }
    };

    const handleSaveChanges = async (section) => {
        setErrorMessage(null);

        if (section === 'general') {
            setIsLoading(true);
            
            let finalImageURL = editableProfileState.avatarUrl;
            
            if (selectedFile) {
                setIsUploadingImage(true);
                try {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Image upload failed');
                    }
                    
                    const { url } = await response.json();
                    finalImageURL = url;
                    setSelectedFile(null);
                } catch (uploadError) {
                    setErrorMessage(`Image upload failed: ${uploadError.message}`);
                    setIsLoading(false);
                    setIsUploadingImage(false);
                    return;
                } finally {
                    setIsUploadingImage(false);
                }
            }
            
            try {
                if (!sessionData?.accessToken) {
                    throw new Error("Your session has expired. Please log out and sign in again.");
                }
                
                const profilePayload = {
                    ...editableProfileState,
                    avatarUrl: finalImageURL,
                };
                
                await authService.updateAdminProfile(sessionData.user.id, profilePayload, sessionData.accessToken);
                
                setIsSuccessPopupVisible(true);
                setIsEditingGeneralInformation(false);
                mutateProfileData();
            } catch (error) {
                setErrorMessage(error.message || "Failed to update profile.");
            } finally {
                setIsLoading(false);
            }
        } else if (section === 'password') {
            setPasswordMismatchError(false);
            setEmptyPasswordError({ new: false, confirm: false });

            const isNewEmpty = !newPasswordValue;
            const isConfirmEmpty = !confirmNewPasswordValue;

            if (isNewEmpty || isConfirmEmpty) {
                setErrorMessage("New password fields cannot be empty.");
                setEmptyPasswordError({ new: isNewEmpty, confirm: isConfirmEmpty });
                return;
            }

            if (newPasswordValue !== confirmNewPasswordValue) {
                setErrorMessage("New passwords do not match.");
                setPasswordMismatchError(true);
                return;
            }
            // Open confirmation modal if validations pass
            setIsConfirmationModalOpen(true);
        }
    };

    const handlePasswordSaveConfirmation = async (currentPassword) => {
        setIsLoading(true);
        setModalErrorMessage(null);

        if (!currentPassword) {
            setModalErrorMessage("Current password is required.");
            setIsLoading(false);
            return;
        }

        try {
            if (!sessionData?.accessToken) {
                throw new Error("You are not authenticated.");
            }
            await authService.changePassword(currentPassword, newPasswordValue, sessionData.accessToken);

            setIsSuccessPopupVisible(true);
            setIsConfirmationModalOpen(false);
            // Reset fields
            setNewPasswordValue('');
            setConfirmNewPasswordValue('');
            setIsEditingPassword(false);

        } catch (passwordChangeError) {
            setModalErrorMessage(passwordChangeError.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewPasswordChange = (event) => {
        setNewPasswordValue(event.target.value);
        if(passwordMismatchError || emptyPasswordError.new) {
            setPasswordMismatchError(false);
            setErrorMessage(null);
            setEmptyPasswordError(previousState => ({...previousState, new: false}));
        }
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmNewPasswordValue(event.target.value);
         if(passwordMismatchError || emptyPasswordError.confirm) {
            setPasswordMismatchError(false);
            setErrorMessage(null);
            setEmptyPasswordError(previousState => ({...previousState, confirm: false}));
        }
    };

    const togglePasswordVisibility = (fieldName) => {
        setPasswordVisibility(previousState => ({ ...previousState, [fieldName]: !previousState[fieldName] }))
    };

    const renderPasswordField = (label, name, value, onChange, fieldName, isReadOnly = false, hasError = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-gray-800 dark:text-gray-200 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${isReadOnly ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'} ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={onChange}
                    readOnly={isReadOnly}
                    disabled={isLoading}
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

    if (sessionStatus === 'loading' || !profileState) {
        return <ProfileContentSkeleton />;
    }

    if (profileFetchError) {
        return <div className="p-6 text-red-500 text-center">Error loading profile: {profileFetchError.message}</div>
    }

    const displayedProfileData = isEditingGeneralInformation ? editableProfileState : profileState;

    return (
        <div className="p-6">
            <PasswordConfirmationModal
                show={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handlePasswordSaveConfirmation}
                loading={isLoading}
                error={modalErrorMessage}
            />
            <SuccessPopup
                show={isSuccessPopupVisible}
                onClose={() => setIsSuccessPopupVisible(false)}
                title="Success"
                message="Your profile has been updated successfully."
            />
            <div className="section-title font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                Profile
            </div>
            <hr className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-8" />
            {errorMessage && (
                <div className={`p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300`}>
                    {errorMessage}
                </div>
            )}
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                <div className="avatar-card w-[220px] p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg flex-shrink-0 self-start">
                    <div className="avatar-content flex items-center">
                        {imagePreviewURL ? (
                            <Image
                                src={imagePreviewURL}
                                alt="Profile Avatar"
                                width={56}
                                height={56}
                                className="avatar-img w-14 h-14 rounded-full mr-3 object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full mr-3 flex items-center justify-center">
                                <DefaultUserIcon className="h-34 w-34 text-gray-700 dark:text-gray-400"/>
                            </div>
                        )}
                        <div className="avatar-info flex flex-col">
                            <div className="avatar-name font-semibold text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                                {displayedProfileData.firstName} {displayedProfileData.lastName}
                            </div>
                            <div className="avatar-role font-semibold text-xs text-gray-500 dark:text-gray-400">
                                Admin
                            </div>
                        </div>
                    </div>
                     <button
                        type="button"
                        onClick={handleUploadButtonClick}
                        disabled={isUploadingImage || !isEditingGeneralInformation || isLoading}
                        className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploadingImage ? "Uploading..." : "Upload Picture"}
                    </button>
                    <input type="file" ref={fileInputReference} onChange={handleFileChange} accept="image/*" className="sr-only" />
                </div>

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <div className="info-card p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
                        <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                            General Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input type="text" name="firstName" value={displayedProfileData.firstName} onChange={handleGeneralInputChange} readOnly={!isEditingGeneralInformation} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneralInformation ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}/>
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input type="text" name="lastName" value={displayedProfileData.lastName} onChange={handleGeneralInputChange} readOnly={!isEditingGeneralInformation} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneralInformation ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}/>
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" name="email" value={displayedProfileData.email} onChange={handleGeneralInputChange} readOnly={!isEditingGeneralInformation} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneralInformation ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}/>
                            </div>
                            <div className="form-group">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={displayedProfileData.phoneNumber} onChange={handleGeneralInputChange} readOnly={!isEditingGeneralInformation} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneralInformation ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}/>
                            </div>
                            <div className="form-group md:col-span-2">
                                <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <input type="text" name="address" value={displayedProfileData.address} onChange={handleGeneralInputChange} readOnly={!isEditingGeneralInformation} className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs ${!isEditingGeneralInformation ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}/>
                            </div>
                        </div>
                        <div className="form-actions flex justify-end items-center gap-3 mt-4">
                            {isEditingGeneralInformation ? (
                                <>
                                    <button onClick={() => handleCancelClick('general')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-sm rounded-md text-gray-800 dark:text-white py-2 px-3 font-semibold text-xs" disabled={isLoading}>Cancel</button>
                                    <button onClick={() => handleSaveChanges('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white text-xs py-2 px-3 font-semibold" disabled={isLoading || isUploadingImage}>{isLoading || isUploadingImage ? "Saving..." : "Save Changes"}</button>
                                </>
                            ) : (
                                <button onClick={() => handleEditClick('general')} className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white py-2 px-3 font-semibold text-xs">Edit Profile</button>
                            )}
                        </div>
                    </div>

                    <div className="info-card-password p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
                        <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">Password Information</div>
                        <div className="space-y-4">
                             <div className="flex gap-3 flex-wrap">
                                {renderPasswordField("New Password", "newPassword", newPasswordValue, handleNewPasswordChange, "new", !isEditingPassword, emptyPasswordError.new || passwordMismatchError)}
                                {renderPasswordField("Confirm New Password", "confirmNewPassword", confirmNewPasswordValue, handleConfirmPasswordChange, "confirm", !isEditingPassword, emptyPasswordError.confirm || passwordMismatchError)}
                            </div>
                        </div>
                         <div className="form-actions flex justify-end items-center gap-3 mt-4">
                             {isEditingPassword ? (
                                <>
                                    <button onClick={() => handleCancelClick('password')} className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md text-gray-800 dark:text-white py-2 px-3 font-semibold text-xs" disabled={isLoading}>Cancel</button>
                                    <button onClick={() => handleSaveChanges('password')} className="save-button bg-blue-600 hover:bg-blue-700 rounded-md text-white py-2 px-3 font-semibold text-xs" disabled={isLoading}>Save Password</button>
                                </>
                            ) : (
                                <button onClick={() => handleEditClick('password')} className="save-button bg-blue-600 hover:bg-blue-700 rounded-md text-white py-2 px-3 font-semibold text-xs" disabled={isLoading}>Change Password</button>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminProfilePage() {
    return (
        <AdminLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </AdminLayout>
    );
}