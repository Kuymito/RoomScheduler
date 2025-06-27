// profile/page.jsx
'use client'; // This directive indicates it's a Client Component

import { useState, useEffect, useRef } from 'react';
import InstructorLayout from '@/components/InstructorLayout'; // Adjusted import path if your InstructorLayout is elsewhere
// Import the newly created sub-components
import AvatarCard from './components/AvatarCard';
import GeneralInfoCard from './components/GeneralInfoCard';
import PasswordInfoCard from './components/PasswordInfoCard';

const ProfileContent = () => {
    // All state management for the profile page
    const [profileData, setProfileData] = useState({
        firstName: "Linda",
        lastName: "Keo",
        email: "KeoLinda@gmail.com",
        phoneNumber: "123456789",
        address: "Phnom Penh",
        avatarUrl: "/images/reach.jpg",
        password: "password123", // Note: In a real app, passwords should not be stored in client-side state like this.
        degree: "M.A.",
        department: "Faculty of IT",
        major: "IT",
    });

    const [editableProfileData, setEditableProfileData] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // State for actual image upload status
    const fileInputRef = useRef(null);
    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [passwordMismatchError, setPasswordMismatchError] = useState(false);
    const [loading, setLoading] = useState(false); // Global loading state for saving operations
    const [error, setError] = useState(null); // Global error message
    const [successMessage, setSuccessMessage] = useState(null); // Global success message
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // In a real app, you would fetch profileData from an API here
            setImagePreviewUrl(profileData.avatarUrl); // Set initial image preview
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
            // Simulate API call to save general info
            await new Promise(resolve => setTimeout(resolve, 700));
            const dataToSave = isEditingGeneral ? editableProfileData : profileData;
            const updatedProfile = { ...dataToSave, avatarUrl: imagePreviewUrl };
            setProfileData(updatedProfile); // Update main profile state
            setIsEditingGeneral(false); // Exit editing mode
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

        const isCurrentPasswordEmpty = !currentPassword.trim(); // Use trim() to account for whitespace
        const isNewPasswordEmpty = !newPassword.trim();
        const isConfirmPasswordEmpty = !confirmNewPassword.trim();

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

        // In a real app, you'd verify currentPassword against the backend here
        // For this example, we'll assume it's valid if not empty.

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            setPasswordMismatchError(true);
            setLoading(false);
            return;
        }

        try {
            // Simulate API call to change password
            await new Promise(resolve => setTimeout(resolve, 700));
            setProfileData(prev => ({ ...prev, password: newPassword })); // Update password in state (for demonstration)
            // Clear password fields after successful save
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false); // Exit editing mode
            setSuccessMessage("Password updated successfully!");
        } catch (err) {
            setError(`Error changing password: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handler to initiate editing for a section
    const handleEditClick = (section) => {
        setError(null); // Clear any previous errors
        setSuccessMessage(null); // Clear any previous success messages
        if (section === 'general') {
            setEditableProfileData({ ...profileData }); // Copy current data for editing
            setIsEditingGeneral(true);
        } else if (section === 'password') {
            setIsEditingPassword(true);
        }
    };

    // Handler to cancel editing for a section
    const handleCancelClick = (section) => {
        setError(null);
        setSuccessMessage(null);
        if (section === 'general') {
            setEditableProfileData(null); // Discard edited data
            setImagePreviewUrl(profileData.avatarUrl); // Revert image preview
            setIsEditingGeneral(false);
        } else if (section === 'password') {
            // Clear password fields and reset errors
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setPasswordMismatchError(false);
            setEmptyPasswordError({ current: false, new: false, confirm: false });
        }
    };

    // Handler to save changes for a section
    const handleSaveClick = (section) => {
        if (section === 'general') {
            saveGeneralInfo();
        } else if (section === 'password') {
            savePassword();
        }
    };

    // General input change handler for editable profile data
    const handleGeneralInputChange = (e) => {
        const { name, value } = e.target;
        setEditableProfileData(prev => ({ ...prev, [name]: value }));
    };

    // Password input change handlers
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

    // Handler for image file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
                // Automatically go into general editing mode if image is changed
                if (!isEditingGeneral) {
                    setIsEditingGeneral(true);
                    setEditableProfileData({ ...profileData });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Toggle visibility of password fields
    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Trigger click on hidden file input
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Consolidated handler for password edit/save button
    const handlePasswordEditToggle = () => {
        if (isEditingPassword) {
            savePassword();
        } else {
            setIsEditingPassword(true);
            setSuccessMessage(null); // Clear success message when starting edit
            setError(null); // Clear error message when starting edit
        }
    };

    // Effect to fetch initial profile data on component mount
    useEffect(() => {
        fetchProfileData();
    }, []); // Empty dependency array ensures it runs only once on mount

    return (
        <div className="p-6">
            <div className="section-title font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                Profile
            </div>
            <hr className="border-t border-gray-300 dark:border-gray-700 mt-4 mb-8" />
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                {/* Avatar Card */}
                <AvatarCard
                    profileData={profileData}
                    imagePreviewUrl={imagePreviewUrl}
                    isEditingGeneral={isEditingGeneral}
                    editableProfileData={editableProfileData}
                    handleUploadButtonClick={handleUploadButtonClick}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
                    handleFileChange={handleFileChange}
                    loading={loading}
                />

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    {/* General Information Card */}
                    <GeneralInfoCard
                        profileData={profileData}
                        editableProfileData={editableProfileData}
                        isEditingGeneral={isEditingGeneral}
                        handleGeneralInputChange={handleGeneralInputChange}
                        handleSaveClick={handleSaveClick}
                        handleCancelClick={handleCancelClick}
                        handleEditClick={handleEditClick}
                        loading={loading}
                    />

                    {/* Password Information Card */}
                    <PasswordInfoCard
                        currentPassword={currentPassword}
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        isEditingPassword={isEditingPassword}
                        loading={loading}
                        emptyPasswordError={emptyPasswordError}
                        passwordMismatchError={passwordMismatchError}
                        passwordVisibility={passwordVisibility}
                        handleCurrentPasswordChange={handleCurrentPasswordChange}
                        handleNewPasswordChange={handleNewPasswordChange}
                        handleConfirmPasswordChange={handleConfirmPasswordChange}
                        togglePasswordVisibility={togglePasswordVisibility}
                        handlePasswordEditToggle={handlePasswordEditToggle}
                        handleCancelClick={handleCancelClick}
                        error={error} // Pass general error to PasswordInfoCard for display
                        successMessage={successMessage} // Pass general success message
                    />
                </div>
            </div>
        </div>
    );
};

// This is the default export for the Next.js page
export default function InstructorDashboardPage() {
    return (
        <InstructorLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </InstructorLayout>
    );
}