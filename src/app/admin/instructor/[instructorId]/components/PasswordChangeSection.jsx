"use client";

import { useState } from 'react';
// import { instructorService } from '@/services/instructor.service';
import { InputField } from './FormControls/index.js'; // Import from your new file
import ActionButton from './ActionButton';   // Import from your new file

export default function PasswordChangeSection({ instructorId }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleOpenModal = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!newPassword || !confirmPassword) {
            setError('Please fill out both new password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmPasswordChange = async () => {
        if (!currentPassword) {
            alert("Please enter your current password.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Your API call here
            console.log("Submitting password change...");
            setSuccessMessage('Password changed successfully!');
            setIsModalOpen(false);
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        } catch (err) {
            setError(err.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Change Password</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}
            
            <form onSubmit={handleOpenModal} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <InputField 
                    label="New Password" 
                    name="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputField 
                    label="Confirm New Password" 
                    name="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="md:col-span-2 flex justify-end">
                    <ActionButton type="submit" variant="danger">
                        Change Password
                    </ActionButton>
                </div>
            </form>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md m-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Confirm Your Identity</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            For your security, please enter your current password to make this change.
                        </p>
                        <div className="mt-6">
                             <InputField 
                                label="Current Password" 
                                name="currentPassword" 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <ActionButton variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </ActionButton>
                            <ActionButton variant="danger" onClick={handleConfirmPasswordChange} disabled={loading}>
                                {loading ? 'Confirming...' : 'Confirm & Change'}
                            </ActionButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}