"use client";

import { useState } from 'react';
import { InputField } from './FormControls/index.js'; // Assuming this is the correct path
import ActionButton from './ActionButton'; // Assuming this is the correct path
import { instructorService } from '@/services/instructor.service'; // Assuming you have a service for this
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';


export default function PasswordChangeSection({ instructorId }) {
    const { data: session } = useSession();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
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

        setLoading(true);
        try {
            // This is where you would call your actual API
            // For example:
            // await instructorService.resetPassword(instructorId, newPassword, session.accessToken);
            
            console.log("Submitting password change for instructor:", instructorId);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulating network delay

            setSuccessMessage('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
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

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                    <ActionButton type="submit" variant="danger" disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </ActionButton>
                </div>
            </form>
        </div>
    );
}