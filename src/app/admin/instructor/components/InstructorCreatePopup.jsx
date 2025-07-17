'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios'; // Import axios for the upload request

// A default SVG icon for the avatar placeholder.
const DefaultAvatarIcon = ({ className = "w-full h-full" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const InstructorCreatePopup = ({ isOpen, onClose, onSave, departments, departmentsError, existingInstructors }) => {
    // Define options for select fields.
    const qualificationOptions = ['Master', 'PhD', 'Doctor'];
    const majorOptions = useMemo(() => {
        if (!departments) return [];
        return departments.map(dep => dep.name);
    }, [departments]);

    // Refs for the popup and the hidden file input.
    const popupRef = useRef(null);
    const fileInputRef = useRef(null);

    // Helper function to define the initial state of the form.
    const getInitialState = () => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        degree: qualificationOptions[0],
        major: '',
        address: '',
        departmentId: departments?.[0]?.departmentId || '',
        password: '',
        roleId: 2, // Default roleId as per API requirements.
    });

    const [newInstructor, setNewInstructor] = useState(getInitialState());
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null); // State to hold the file object
    const [formError, setFormError] = useState({ fields: [], message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to reset the form state whenever the popup is opened or department data changes.
    useEffect(() => {
        if (isOpen) {
            setNewInstructor(getInitialState());
            setImagePreviewUrl(null);
            setProfileImageFile(null);
            setFormError({ fields: [], message: '' });
        }
    }, [isOpen, departments]);

    // Handles changes to form input and select fields.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'firstName' || name === 'lastName') {
            if (/^[A-Za-z\s]*$/.test(value)) {
                setNewInstructor(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'phone') {
            if (/^\d*$/.test(value) && value.length <= 15) {
                setNewInstructor(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'major') {
            if (/^[A-Za-z\s]*$/.test(value)) {
                setNewInstructor(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'address') {
            if (/^[A-Za-z0-9\s,]*$/.test(value)) {
                setNewInstructor(prev => ({ ...prev, [name]: value }));
            }
        }
        else {
            setNewInstructor(prev => ({ ...prev, [name]: value }));
        }

        if (formError.fields.includes(name)) {
            setFormError({ fields: [], message: '' });
        }
    };

    // Handles the file selection for the profile image.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file); // Store the raw file
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result); // Set preview URL
            };
            reader.readAsDataURL(file);
        }
    };

    // Triggers a click on the hidden file input.
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Removes the selected profile image.
    const handleRemoveImage = () => {
        setImagePreviewUrl(null);
        setProfileImageFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handles the form submission.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError({ fields: [], message: '' });
        setIsSubmitting(true);

        // --- NEW: Detailed Field Validation ---
        const fieldsToValidate = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            phone: 'Phone Number',
            major: 'Major',
            address: 'Address',
            password: 'Password',
        };

        for (const [field, name] of Object.entries(fieldsToValidate)) {
            if (!newInstructor[field] || !newInstructor[field].trim()) {
                setFormError({
                    fields: [field],
                    message: `${name} cannot be empty or contain only spaces.`
                });
                setIsSubmitting(false);
                return;
            }
        }

        // --- DUPLICATE EMAIL CHECK ---
        const isDuplicateEmail = existingInstructors.some(
            (inst) => inst.email.toLowerCase() === newInstructor.email.toLowerCase().trim()
        );

        if (isDuplicateEmail) {
            setFormError({
                fields: ['email'],
                message: `An instructor with the email "${newInstructor.email}" already exists.`
            });
            setIsSubmitting(false);
            return;
        }

        // --- PHONE NUMBER VALIDATION ---
        if (newInstructor.phone.trim().length < 8 || newInstructor.phone.trim().length > 15) {
            setFormError({
                fields: ['phone'],
                message: 'Phone number must be between 8 and 15 digits.'
            });
            setIsSubmitting(false);
            return;
        }
        
        // --- UPLOAD IMAGE FIRST (if one is selected) ---
        let finalImageUrl = '';
        if (profileImageFile) {
            const formData = new FormData();
            formData.append('file', profileImageFile);
            try {
                const response = await axios.post('/api/upload', formData);
                finalImageUrl = response.data.url;
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                setFormError({ fields: [], message: 'Image upload failed. Please try again.' });
                setIsSubmitting(false);
                return;
            }
        }

        // --- PREPARE AND VALIDATE PAYLOAD ---
        const payload = {
            ...newInstructor,
            departmentId: Number(newInstructor.departmentId),
            profile: finalImageUrl,
        };

        // Final check for non-string fields
        if (!payload.departmentId || !payload.degree) {
             setFormError({ fields: [], message: 'Please ensure all fields are selected.' });
             setIsSubmitting(false);
             return;
        }

        try {
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Error during onSave:", error);
            setFormError({ fields: [], message: 'Failed to create instructor.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Effect to handle clicks outside the popup to close it.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const getErrorClass = (fieldName) => {
        return formError.fields.includes(fieldName) 
            ? 'border-red-500 ring-1 ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Instructor</h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    {/* Photo Upload Section */}
                    <div className="flex flex-row items-center gap-4 mb-5">
                        {imagePreviewUrl ? (
                            <img
                                src={imagePreviewUrl}
                                alt="Profile Preview"
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                <DefaultAvatarIcon className="w-26 h-26" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleUploadButtonClick}
                            className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                        >
                            {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {imagePreviewUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                                aria-label="Remove image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        )}
                        <input
                            type="file"
                            id="profileImage"
                            name="profile"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="sr-only"
                        />
                    </div>

                    {/* Form Fields Section */}
                    <div className="grid grid-cols-2 gap-3 mb-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="firstName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={newInstructor.firstName} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('firstName')}`} placeholder="John" required maxLength="30" />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={newInstructor.lastName} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('lastName')}`} placeholder="Doe" required maxLength="30" />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="email" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" name="email" value={newInstructor.email} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('email')}`} placeholder="john.doe@example.com" required maxLength="254" />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="password" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" id="password" name="password" value={newInstructor.password} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('password')}`} placeholder="••••••••" required minLength={8} maxLength="64" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="text" id="phone" name="phone" value={newInstructor.phone} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('phone')}`} placeholder="012345678" required minLength="8" maxLength="15" />
                        </div>
                        <div>
                            <label htmlFor="degree" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="degree" name="degree" value={newInstructor.degree} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required>
                                {qualificationOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="major" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <input
                                type="text"
                                id="major"
                                name="major"
                                value={newInstructor.major}
                                onChange={handleInputChange}
                                className={`bg-gray-50 border text-gray-900 dark:text-white text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('major')}`}
                                placeholder="e.g., Computer Science"
                                required
                                maxLength="50"
                            />
                        </div>
                        <div>
                            <label htmlFor="departmentId" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Department / Faculty</label>
                            <select id="departmentId" name="departmentId" value={newInstructor.departmentId} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" required>
                                {departmentsError && <option value="">Error loading departments</option>}
                                {!departments && !departmentsError && <option value="">Loading...</option>}
                                {departments && departments.map(dep => (<option key={dep.departmentId} value={dep.departmentId}>{dep.name}</option>))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input id="address" name="address" value={newInstructor.address} onChange={handleInputChange} className={`bg-gray-50 border text-gray-900 text-xs rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 ${getErrorClass('address')}`} placeholder="123 Main Street, City, Country" required minLength={20} maxLength={60} />
                        </div>
                    </div>
                    {formError.message && (
                        <div className="text-red-500 text-xs text-center mb-4">
                            {formError.message}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Creating...' : 'Create Instructor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreatePopup;