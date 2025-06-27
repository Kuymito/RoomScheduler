// components/Profile/PasswordInfoCard.js
'use client';

import React from 'react';

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

export default function PasswordInfoCard({
    profileData,
    newPassword,
    confirmNewPassword,
    isEditingPassword,
    passwordVisibility,
    emptyPasswordError,
    passwordMismatchError,
    loading,
    setNewPassword,
    setConfirmNewPassword,
    setIsEditingPassword,
    setPasswordVisibility,
    setPasswordMismatchError,
    setEmptyPasswordError,
    setProfileData,
    setLoading,
    setError,
    setSuccessMessage,
}) {
    const handleSavePassword = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPasswordMismatchError(false);
        setEmptyPasswordError({ new: false, confirm: false });

        if (!newPassword || !confirmNewPassword) {
            setError("New and confirm password fields are required.");
            setEmptyPasswordError({ new: !newPassword, confirm: !confirmNewPassword });
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
            await new Promise(resolve => setTimeout(resolve, 500));
            setProfileData(prev => ({ ...prev, password: newPassword }));
            setNewPassword('');
            setConfirmNewPassword('');
            setIsEditingPassword(false);
            setSuccessMessage("Password updated successfully!");
        } catch (err) {
            setError("Error changing password: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const renderPasswordField = (label, name, value, onChange, fieldName, hasError = false) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-semibold text-xs mb-1">{label}</label>
            <div className="relative">
                <input
                    type={passwordVisibility[fieldName] ? 'text' : 'password'}
                    name={name}
                    className={`form-input w-full py-2 px-3 rounded-md text-xs ${hasError || emptyPasswordError[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border'} dark:text-white`}
                    value={value}
                    onChange={onChange}
                    readOnly={!isEditingPassword}
                    disabled={loading}
                />
                {isEditingPassword && (
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility(fieldName)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                        aria-label={passwordVisibility[fieldName] ? "Hide password" : "Show password"}
                    >
                        {passwordVisibility[fieldName] ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
            <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">Password Information</div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility.current ? 'text' : 'password'}
                            readOnly
                            value={profileData.password}
                            className="form-input w-full py-2 px-3 bg-gray-100 border rounded-md text-xs text-gray-500 dark:text-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                        >
                            {passwordVisibility.current ? <EyeClosedIcon /> : <EyeOpenIcon />}
                        </button>
                    </div>
                </div>
                {renderPasswordField('New Password', 'newPassword', newPassword, (e) => setNewPassword(e.target.value), 'new')}
            </div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                {renderPasswordField('Confirm New Password', 'confirmNewPassword', confirmNewPassword, (e) => setConfirmNewPassword(e.target.value), 'confirm', passwordMismatchError)}
            </div>
            <div className="form-actions flex justify-end items-center gap-3 mt-4">
                {isEditingPassword ? (
                    <>
                        <button
                            onClick={() => {
                                setNewPassword('');
                                setConfirmNewPassword('');
                                setIsEditingPassword(false);
                                setPasswordMismatchError(false);
                                setEmptyPasswordError({ new: false, confirm: false });
                            }}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md py-2 px-3 text-xs font-semibold"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePassword}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-xs font-semibold"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Password'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditingPassword(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-3 text-xs font-semibold"
                        disabled={loading}
                    >
                        Change Password
                    </button>
                )}
            </div>
        </div>
    );
}
