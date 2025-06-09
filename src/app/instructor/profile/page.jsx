// components/ProfileContent.js
'use client';

import { useState, useEffect, useRef } from 'react';
import InstructorLayout from '@/components/InstructorLayout'; // Adjusted import path
import Image from 'next/image';

// --- Icon Components ---
const EyeOpenIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeClosedIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228
         3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

// Follow Icon (Placeholder - Replace with your image or SVG)
const FollowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const ProfileContent = () => {
    const [profileData, setProfileData] = useState({
        firstName: "Linda",
        lastName: "Keo",
        email: "KeoLinda@gmail.com",
        phoneNumber: "123456789",
        address: "Phnom Penh",
        avatarUrl: "/images/reach.jpg", // Replace with the actual avatar URL from the image
        password: "password123",
        degree: "M.A.",
        department: "Faculty of IT",
        major: "",
        dateOfBirth: "",
    });

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
    const [emptyPasswordError, setEmptyPasswordError] = useState({
        new: false,
        confirm: false,
        current: false,
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
        setEmptyPasswordError({ new: false, confirm: false, current: false });

        const isCurrentPasswordEmpty = !currentPassword;
        const isNewPasswordEmpty = !newPassword;
        const isConfirmPasswordEmpty = !confirmNewPassword;

        if (isCurrentPasswordEmpty || isNewPasswordEmpty || isConfirmPasswordEmpty) {
            setError("All password fields are required.");
            setEmptyPasswordError({
                current: isCurrentPasswordEmpty,
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
            setCurrentPassword('');
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
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ current: false, new: false, confirm: false });
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

    const handleCurrentPasswordChange = (e) => {
        setCurrentPassword(e.target.value);
        if (emptyPasswordError.current) {
            setEmptyPasswordError(prev => ({ ...prev, current: false }));
            setError(null);
        }
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

    const renderPasswordField = (label, name, value, onChange, fieldName, hasError = false, readOnly = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? "text" : "password"}
                    name={name}
                    className={`form-input w-full py-2 px-3 bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                        hasError || emptyPasswordError[fieldName]
                            ? 'border-red-500 ring-1 ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly || !isEditingPassword}
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
      <div className="p-6">
        <div className="section-title font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
          Profile
        </div>
        <hr className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-8" />
        <div className="profile-section flex gap-8 mb-4 flex-wrap">
          {/* Avatar Card */}
          <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg flex-shrink-0">
            <div className="avatar-content flex items-center">
              <Image
                src={imagePreviewUrl || profileData.avatarUrl}
                alt="Profile Avatar"
                width={56}
                height={56}
                className="avatar-img w-12 h-12 rounded-full mr-3 object-cover mb-6"
              />
              <div className="avatar-info flex flex-col">
                <div className="avatar-name font-semibold text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                  Dr.{" "}
                  {isEditingGeneral
                    ? `${editableProfileData?.firstName ?? ""} ${
                        editableProfileData?.lastName ?? ""
                      }`.trim()
                    : `${profileData.firstName} ${profileData.lastName}`.trim()}
                </div>
                <div className="avatar-role font-semibold text-xs text-gray-500 dark:text-gray-400">
                  Instructor
                </div>
                <button
                  type="button"
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                  className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold
                                 text-white bg-blue-600 hover:bg-blue-700
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                   focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {isUploading ? "Uploading..." : "Upload Picture"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="sr-only"
                />
              </div>
            </div>
          </div>

          <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
            {/* General Information Card */}
            <div className="info-card p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
              <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                General Information
              </div>

              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.firstName || ""
                        : profileData.firstName
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.lastName || ""
                        : profileData.lastName
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.email || ""
                        : profileData.email
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.phoneNumber || ""
                        : profileData.phoneNumber
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    name="degree"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.degree || ""
                        : profileData.degree
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
                {/* major */}
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    name="major"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.major || ""
                        : profileData.major
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* department */}
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                      !isEditingGeneral
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                    value={
                      isEditingGeneral
                        ? editableProfileData?.department || ""
                        : profileData.department
                    }
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <div className="form-group flex-1 min-w-[200px]">
                    <input
                      type="text"
                      name="address"
                      className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                        !isEditingGeneral
                          ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      }`}
                      value={
                        isEditingGeneral
                          ? editableProfileData?.address || ""
                          : profileData.address
                      }
                      onChange={handleGeneralInputChange}
                      readOnly={!isEditingGeneral}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions flex justify-end items-center gap-3 mt-4">
                {isEditingGeneral ? (
                  <>
                    <button
                      onClick={() => handleCancelClick("general")}
                      className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-sm rounded-md text-gray-800 dark:text-gray-200 border-none py-2 px-3 font-semibold text-xs cursor-pointer"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveClick("general")}
                      className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white text-xs border-none py-2 px-3 font-semibold  cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditClick("general")}
                    className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer"
                    disabled={loading}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Password Information Card */}
            <div className="info-card-password p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
              <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                Password Information
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                {renderPasswordField(
                  "Current Password",
                  "currentPassword",
                  currentPassword,
                  handleCurrentPasswordChange,
                  "current",
                  emptyPasswordError.current
                )}
                {renderPasswordField(
                  "New Password",
                  "newPassword",
                  newPassword,
                  handleNewPasswordChange,
                  "new",
                  emptyPasswordError.new
                )}
              </div>

              <div className="form-actions flex justify-end items-center gap-3 mt-4">
                {isEditingPassword ? (
                  <>
                    <button
                      onClick={() => handleCancelClick("password")}
                      className="back-button bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 shadow-sm rounded-md text-gray-800 dark:text-gray-200 border-none py-2 px-3 font-semibold text-xs cursor-pointer"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveClick("password")}
                      className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white text-xs border-none py-2 px-3 font-semibold  cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditClick("password")}
                    className="save-button bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-white border-none py-2 px-3 font-semibold text-xs cursor-pointer"
                    disabled={loading}
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default function InstructorDashboardPage() {
    return (
        <InstructorLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </InstructorLayout>
    );
}