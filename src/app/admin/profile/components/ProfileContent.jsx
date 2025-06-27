// components/ProfileContent.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import GeneralInfoCard from './Profile/GeneralInfoCard.jsx';
import PasswordInfoCard from './Profile/PasswordInfoCard.jsx';

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

    useEffect(() => {
        fetchProfileData();
    }, []);

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">
                Profile
            </div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
            <div className="profile-section flex gap-8 mb-4 flex-wrap">
                <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg flex-shrink-0">
                    <div className="avatar-content flex">
                        <Image
                            src={imagePreviewUrl || profileData.avatarUrl}
                            alt="Profile Avatar"
                            width={56}
                            height={56}
                            className="avatar-img w-14 h-14 rounded-full mr-3 object-cover"
                        />
                        <div className="avatar-info flex flex-col">
                            <div className="avatar-name font-semibold text-sm text-black dark:text-white mb-0.5">
                                {isEditingGeneral ? `${editableProfileData?.firstName ?? ''} ${editableProfileData?.lastName ?? ''}`.trim() : `${profileData.firstName} ${profileData.lastName}`.trim()}
                            </div>
                            <div className="avatar-role font-semibold text-xs text-gray-500 dark:text-gray-400">Admin</div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Photo'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={(e) => {
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
                            }} accept="image/*" className="sr-only" />
                        </div>
                    </div>
                </div>

                <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                    <GeneralInfoCard
                        profileData={profileData}
                        editableProfileData={editableProfileData}
                        isEditingGeneral={isEditingGeneral}
                        setEditableProfileData={setEditableProfileData}
                        setIsEditingGeneral={setIsEditingGeneral}
                        setProfileData={setProfileData}
                        imagePreviewUrl={imagePreviewUrl}
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                        successMessage={successMessage}
                        setSuccessMessage={setSuccessMessage}
                    />

                    <PasswordInfoCard
                        profileData={profileData}
                        newPassword={newPassword}
                        confirmNewPassword={confirmNewPassword}
                        isEditingPassword={isEditingPassword}
                        passwordVisibility={passwordVisibility}
                        emptyPasswordError={emptyPasswordError}
                        passwordMismatchError={passwordMismatchError}
                        loading={loading}
                        setNewPassword={setNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        setIsEditingPassword={setIsEditingPassword}
                        setPasswordVisibility={setPasswordVisibility}
                        setPasswordMismatchError={setPasswordMismatchError}
                        setEmptyPasswordError={setEmptyPasswordError}
                        setProfileData={setProfileData}
                        setLoading={setLoading}
                        setError={setError}
                        setSuccessMessage={setSuccessMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboardPage() {
    return (
        <AdminLayout activeItem="profile" pageTitle="Profile">
            <ProfileContent />
        </AdminLayout>
    );
}
