// components/Profile/GeneralInfoCard.js
'use client';

import React from 'react';

export default function GeneralInfoCard({
    profileData,
    editableProfileData,
    isEditingGeneral,
    setEditableProfileData,
    setIsEditingGeneral,
    setProfileData,
    imagePreviewUrl,
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
}) {
    const handleGeneralInputChange = (e) => {
        const { name, value } = e.target;
        setEditableProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelClick = () => {
        setError(null);
        setSuccessMessage(null);
        setEditableProfileData(null);
        setIsEditingGeneral(false);
    };

    const handleSaveClick = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const updatedProfile = { ...editableProfileData, avatarUrl: imagePreviewUrl };
            setProfileData(updatedProfile);
            setIsEditingGeneral(false);
            setSuccessMessage("General information updated successfully!");
        } catch (err) {
            setError("Error saving general info: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
            <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">General Information</div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        className={`form-input w-full py-2 px-3 border rounded-md text-xs ${!isEditingGeneral ? 'bg-gray-100 text-gray-500' : 'bg-num-content-bg'} dark:text-white`}
                        value={isEditingGeneral ? editableProfileData?.firstName || '' : profileData.firstName}
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        className={`form-input w-full py-2 px-3 border rounded-md text-xs ${!isEditingGeneral ? 'bg-gray-100 text-gray-500' : 'bg-num-content-bg'} dark:text-white`}
                        value={isEditingGeneral ? editableProfileData?.lastName || '' : profileData.lastName}
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-600 rounded-md text-xs text-gray-500"
                        value={profileData.email}
                        readOnly
                        disabled
                    />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        className={`form-input w-full py-2 px-3 border rounded-md text-xs ${!isEditingGeneral ? 'bg-gray-100 text-gray-500' : 'bg-num-content-bg'} dark:text-white`}
                        value={isEditingGeneral ? editableProfileData?.phoneNumber || '' : profileData.phoneNumber}
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        className={`form-input w-full py-2 px-3 border rounded-md text-xs ${!isEditingGeneral ? 'bg-gray-100 text-gray-500' : 'bg-num-content-bg'} dark:text-white`}
                        value={isEditingGeneral ? editableProfileData?.address || '' : profileData.address}
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="form-actions flex justify-end items-center gap-3 mt-4">
                {isEditingGeneral ? (
                    <>
                        <button
                            onClick={handleCancelClick}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md py-2 px-3 text-xs font-semibold"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-xs font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setEditableProfileData({ ...profileData });
                            setIsEditingGeneral(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-xs font-semibold"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
}