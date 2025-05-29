// components/ProfileContent.js
'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout'; // Adjust the import path as necessary
import Image from 'next/image';

const ProfileContent = () => {
  // State for user profile data
  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "",
    email: "admin@gmail.com",
    phoneNumber: "+855 12 345 678",
    address: "Phnom Penh, Cambodia",
    // avatarUrl: "/images/kok.png", // Assuming you'd get this from API too
  });

  // State for editable data (when in edit mode)
  const [editableProfileData, setEditableProfileData] = useState(null);
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // State for password fields (separate as they are not part of profileData directly)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- API Simulation Functions ---

  // Simulate fetching profile data
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // In a real app, replace this with an actual API call
      // const response = await fetch('/api/profile');
      // if (!response.ok) throw new Error('Failed to fetch profile');
      // const data = await response.json();
      // setProfileData(data);

      // Simulate a delay and then set initial data
      await new Promise(resolve => setTimeout(resolve, 500));
      // For now, we'll just use the initial state as fetched data
      // If you had a real API, you'd setProfileData(data) from the fetch response
      console.log("Simulating fetch profile data...");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Simulate saving general information
  const saveGeneralInfo = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Prepare data for API, exclude email if it's readOnly and not intended for update via this form
      const dataToSave = { ...editableProfileData };
      delete dataToSave.email; // Assuming email cannot be changed via this form

      // In a real app, replace this with an actual API call (e.g., PUT or PATCH)
      // const response = await fetch('/api/profile/general', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSave),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to update general info');
      // }
      // const updatedData = await response.json(); // API might return updated data

      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

      // Update local state after successful "API" call
      setProfileData(dataToSave); // Use dataToSave as mock updatedData
      setIsEditingGeneral(false);
      setSuccessMessage("General information updated successfully!");
      console.log("Simulating API save for general info:", dataToSave);
    } catch (err) {
      console.error("Error saving general info:", err);
      setError(`Error saving general info: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate saving password
  const savePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (newPassword === '' || confirmNewPassword === '') {
      setError("New password and confirm new password cannot be empty.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm new password do not match.");
      setLoading(false);
      return;
    }

    // You might want to add more robust client-side validation for password strength here

    try {
      // In a real app, replace this with an actual API call (e.g., PUT or PATCH)
      // const response = await fetch('/api/profile/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to change password');
      // }

      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

      // Clear password fields and exit editing mode after successful "API" call
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsEditingPassword(false);
      setSuccessMessage("Password updated successfully!");
      console.log("Simulating API save for password change.");
    } catch (err) {
      console.error("Error changing password:", err);
      setError(`Error changing password: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []); // Empty dependency array means this runs once on mount

  // --- Handlers for UI Interactions ---

  const handleGeneralEditToggle = () => {
    if (isEditingGeneral) {
      saveGeneralInfo();
    } else {
      setIsEditingGeneral(true);
      setEditableProfileData({ ...profileData }); // Copy current data for editing
      setSuccessMessage(null); // Clear success message when entering edit mode
      setError(null); // Clear error message when entering edit mode
    }
  };

  const handlePasswordEditToggle = () => {
    if (isEditingPassword) {
      savePassword();
    } else {
      setIsEditingPassword(true);
      setSuccessMessage(null); // Clear success message
      setError(null); // Clear error message
    }
  };

  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrentPasswordChange = (e) => setCurrentPassword(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmNewPasswordChange = (e) => setConfirmNewPassword(e.target.value);


  return (
    <>
      <div className='p-6 dark:text-white'>
        <div className="section-title font-semibold text-lg text-num-dark-text mb-4">
          Profile
        </div>
        <hr className="border-t border-gray-200 mt-4 mb-8" />
        <div className="profile-section flex gap-8 mb-4 flex-wrap">
          {/* Avatar Card */}
          <div className="avatar-card w-[311px] h-[130px] p-3 bg-white border border-num-gray-light shadow-custom-light rounded-lg flex-shrink-0">
            <div className="avatar-content flex">
              <Image
                src="/images/kok.png" // This should ideally come from profileData.avatarUrl
                alt="Profile Avatar"
                width={56}
                height={56}
                className="avatar-img w-14 h-14 rounded-full bg-num-content-bg mr-3"
              />
              <div className="avatar-info flex flex-col">
                <div className="avatar-name font-semibold text-lg text-black mb-0.5">
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
            <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light shadow-custom-light rounded-lg">
              <div className="section-title font-semibold text-base text-num-dark-text mb-3">General information</div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                    value={isEditingGeneral ? editableProfileData?.firstName || '' : profileData.firstName}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                    value={isEditingGeneral ? editableProfileData?.lastName || '' : profileData.lastName}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light rounded-md font-medium text-[14px] text-gray-500"
                    value={profileData.email} // Email is always read-only
                    readOnly
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                    value={isEditingGeneral ? editableProfileData?.phoneNumber || '' : profileData.phoneNumber}
                    onChange={handleGeneralInputChange}
                    readOnly={!isEditingGeneral}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
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
            <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light shadow-custom-light rounded-lg">
              <div className="section-title font-semibold text-base text-num-dark-text mb-3">Password information</div>
              <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Current Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                  />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">New Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
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
                  <label className="form-label block font-medium text-sm text-num-dark-text mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input w-full py-2 px-3 bg-num-content-bg border border-num-gray-light rounded-md font-medium text-[14px] text-num-dark-text"
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
            <ProfileContent/>
        </AdminLayout>
    );
}