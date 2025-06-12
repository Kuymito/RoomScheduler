// components/ProfileContent.js
'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Adjust the import path as necessary
import Image from 'next/image';

// --- Icon Components ---
const EyeOpenIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeClosedIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);


const ProfileContent = () => {
    const [profileData, setProfileData] = useState({
        firstName: "Admin",
        lastName: "",
        email: "admin@gmail.com",
        phoneNumber: "+855 12 345 678",
        address: "Phnom Penh, Cambodia",
        avatarUrl: "/images/kok.png",
        password: "password123",
    });

    const [editableProfileData, setEditableProfileData] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [emptyPasswordError, setEmptyPasswordError] = useState({
        new: false,
        confirm: false,
    });
    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // --- Handlers ---
    const fetchProfileData = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setImagePreviewUrl(profileData.avatarUrl);
        } catch (err) {
            setError("Failed to load profile data.");
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
            const dataToSave = isEditingGeneral ? editableProfileData : profileData;
            const updatedProfile = { ...dataToSave, avatarUrl: imagePreviewUrl };
            setProfileData(updatedProfile);
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
            setProfileData(prev => ({ ...prev, password: newPassword }));
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
            setEditableProfileData(null);
            setImagePreviewUrl(profileData.avatarUrl);
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

    const handleGeneralInputChange = (e) => {
        const { name, value } = e.target;
        setEditableProfileData(prev => ({ ...prev, [name]: value }));
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
                if (!isEditingGeneral) {
                    setIsEditingGeneral(true);
                    setEditableProfileData({ ...profileData });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    const renderPasswordField = (label, name, value, onChange, fieldName, hasError = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3  bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400 ${
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

    // --- Hooks ---
    useEffect(() => {
        fetchProfileData();
    }, []);

  return (
    <>
      <div className='p-6 dark:text-white'> {/* RESOLVED: Kept incoming changes for this block */}
        <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">
          Profile
        </div>
        <hr className="border-t border-gray-200 mt-4 mb-8" /> {/* RESOLVED: Kept incoming changes for this block */}
        <div className="profile-section flex gap-8 mb-4 flex-wrap">
          {/* Avatar Card */}
          <div className="avatar-card w-[311px] h-[130px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
            <div className="avatar-content flex">
              <Image
                src="/images/kok.png" // This should ideally come from profileData.avatarUrl
                alt="Profile Avatar"
                width={56}
                height={56}
                className="avatar-img w-14 h-14 rounded-ful mr-3"
              />
              <div className="avatar-info flex flex-col">
                <div className="avatar-name font-semibold text-lg text-black dark:text-white mb-0.5">
                  {profileData.firstName} {profileData.lastName}
                </div>
                <div className="avatar-role text-[15px] text-num-gray mb-2">Admin</div>
                <button
                  className="avatar-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"
                  disabled={loading} // Disable during loading
                >
                  Upload Profile
                </button>
              </div>
            </div>
          </div>
          <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
            {/* General Information Card */}
            <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
              <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">General information</div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600  rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    value={isEditingGeneral ? editableProfileData?.firstName || '' : profileData.firstName}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    value={isEditingGeneral ? editableProfileData?.lastName || '' : profileData.lastName}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-gray-500"
                    value={profileData.email} // Email is always read-only
                    readOnly
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    value={isEditingGeneral ? editableProfileData?.phoneNumber || '' : profileData.phoneNumber}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    value={isEditingGeneral ? editableProfileData?.address || '' : profileData.address}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="form-actions flex justify-end mt-3">
                <button
                  className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"
                  onClick={handleGeneralEditToggle}
                  disabled={loading} // Disable button during loading
                >
                  {loading && isEditingGeneral ? "Saving..." : isEditingGeneral ? "Save Changes" : "Edit Profile"}
                </button>
              </div>
            </div>
            {/* Password Information Card */}
            <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
              <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">Password information</div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Current Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">New Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-[14px] text-num-dark-text dark:text-white"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={handleConfirmNewPasswordChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-actions flex justify-end mt-3">
                <button
                  className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"
                  onClick={handlePasswordEditToggle}
                  disabled={loading} // Disable button during loading
                >
                  {loading && isEditingPassword ? "Saving..." : isEditingPassword ? "Save Password" : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </AdminLayout>
    );
}