'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

// The component accepts a list of departments to populate the "Major" dropdown.
const InstructorCreatePopup = ({ isOpen, onClose, onSave, departments }) => {
    
    // This qualification list is static and can be defined inside the component.
    const qualificationOptions = [
        'Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'
    ];

    // Helper function to define the initial state of the form.
    const getInitialState = () => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        // The 'major' field now safely defaults to the first available department name.
        major: departments?.[0]?.name || '',
        // The field is correctly named 'degree' to match the API payload.
        degree: qualificationOptions[0],
        address: '',
        // The 'profile' field will hold the base64 image data.
        profile: null,
    });

    const [formData, setFormData] = useState(getInitialState());
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false); // State to handle submission loading.

    const popupRef = useRef(null);
    const fileInputRef = useRef(null);

    // A single handler for all form inputs.
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(previousState => ({ ...previousState, [name]: value }));
    };

    // Handles file selection and creates a base64 preview for the UI.
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(previousState => ({ ...previousState, profile: reader.result }));
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(previousState => ({ ...previousState, profile: null }));
            setImagePreviewUrl(null);
        }
    };
    
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // This function handles the form submission.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('First Name, Last Name, and Email are required.');
            return;
        }

        setIsSaving(true); // Disable buttons while the API call is in progress.
        try {
            // `onSave` is the async function passed from the parent component.
            await onSave(formData);
            
            // On success, reset the form and close the popup.
            setFormData(getInitialState());
            setImagePreviewUrl(null);
            onClose();
        } catch (error) {
            // The parent component's onSave function is already configured to show a toast on error.
            // We just log the error here for debugging purposes.
            console.error("Failed to save instructor:", error);
        } finally {
            setIsSaving(false); // Re-enable buttons after the process completes.
        }
    };

    // Resets the form to its initial state every time the popup is opened.
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setImagePreviewUrl(null);
        }
    }, [isOpen, departments]); // Also reset if the departments prop changes.

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Instructor</h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-row items-center gap-4 mb-5">
                        {imagePreviewUrl ? (
                            <img
                                src={imagePreviewUrl}
                                alt="Profile Preview"
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleButtonClick}
                            className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                            disabled={isSaving}
                        >
                            {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {imagePreviewUrl && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(previousState => ({ ...previousState, profile: null }));
                                    setImagePreviewUrl(null);
                                }}
                                className="rounded-md text-red-500 text-sm font-semibold hover:text-red-600 dark:text-red-700 dark:hover:text-red-600"
                                disabled={isSaving}
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.9} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="sr-only"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-16">
                        <div>
                            <label htmlFor="firstName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="John" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Doe" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="john.doe@example.com" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="+855 12 345 678" required />
                        </div>
                        <div>
                            <label htmlFor="major" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select id="major" name="major" value={formData.major} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                                {departments?.map(department => (
                                    <option key={department.departmentId} value={department.name}>{department.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="degree" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="degree" name="degree" value={formData.degree} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                                {qualificationOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input id="address" name="address" value={formData.address} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="123 Main Street, City, Country" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Instructor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreatePopup;