'use client';

import React, { useState, useRef, useEffect } from 'react';

// 1. Accept 'departments' as a prop to populate the dropdown dynamically.
const InstructorCreatePopup = ({ isOpen, onClose, onSave, departments = [] }) => {
    
    // The qualification options remain hardcoded as they are not from the DB.
    const qualificationOptions = [
        'Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'
    ];

    const getInitialState = () => ({
        firstName: '',
        lastName: '',
        email: '',
        password: '', // 4. Added password field to the state
        phone: '',
        // Initialize majorStudied with the first department name, or empty string if not available yet.
        majorStudied: departments.length > 0 ? departments[0].name : '', 
        qualifications: qualificationOptions[0],
        address: '',
        profileImage: null,
    });

    // State to manage the form fields
    const [newInstructor, setNewInstructor] = useState(getInitialState());
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    const popupRef = useRef(null);
    const fileInputRef = useRef(null);

    // 5. Effect to update the form's default major when departments data loads.
    useEffect(() => {
        if (isOpen) {
            // When the popup opens, reset the state to ensure it has the latest department list
            setNewInstructor(getInitialState());
            setImagePreviewUrl(null); // Also reset image preview
        }
    }, [isOpen, departments]);


    // Handle changes to form input/select fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInstructor(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle file input change for profile image
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewInstructor(prev => ({
                    ...prev,
                    profileImage: reader.result, // This will be a base64 string
                }));
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!newInstructor.firstName.trim() || !newInstructor.lastName.trim() || !newInstructor.email.trim() || !newInstructor.password || !newInstructor.phone.trim() || !newInstructor.majorStudied || !newInstructor.address.trim()) {
            alert('Please fill in all required fields, including password.');
            return;
        }

        // 3. Map the form state to the payload structure your API expects.
        const payload = {
            firstName: newInstructor.firstName.trim(),
            lastName: newInstructor.lastName.trim(),
            email: newInstructor.email.trim(),
            password: newInstructor.password,
            phone: newInstructor.phone.trim(),
            major: newInstructor.majorStudied,      // Map 'majorStudied' to 'major'
            degree: newInstructor.qualifications,  // Map 'qualifications' to 'degree'
            profile: newInstructor.profileImage,    // Map 'profileImage' to 'profile'
            address: newInstructor.address.trim(),
        };

        // Pass the correctly structured payload to the parent component.
        onSave(payload);
        onClose(); // Close the popup after saving
    };

    // Effect to handle clicks outside the popup
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Instructor</h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    {/* Photo Upload Section (unchanged) */}
                    <div className="flex flex-row items-center gap-4 mb-5">
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"/>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                        )}
                        <button type="button" onClick={handleButtonClick} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600">
                            {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                         {/* Hidden file input (unchanged) */}
                        <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="sr-only"/>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* First Name & Last Name (unchanged) */}
                         <div>
                            <label htmlFor="firstName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={newInstructor.firstName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="John" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={newInstructor.lastName} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Doe" required />
                        </div>
                        {/* Email (unchanged) */}
                        <div>
                            <label htmlFor="email" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" id="email" name="email" value={newInstructor.email} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="john.doe@example.com" required />
                        </div>
                         {/* 4. Password Field ADDED */}
                        <div>
                            <label htmlFor="password" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" id="password" name="password" value={newInstructor.password} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="••••••••" required />
                        </div>
                        {/* Phone Number (unchanged) */}
                         <div>
                            <label htmlFor="phone" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="text" id="phone" name="phone" value={newInstructor.phone} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="+855 12 345 678" required />
                        </div>
                        
                        {/* 2. Major Dropdown - NOW DYNAMIC */}
                        <div>
                            <label htmlFor="majorStudied" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select id="majorStudied" name="majorStudied" value={newInstructor.majorStudied} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required >
                                {departments.length === 0 && <option>Loading departments...</option>}
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Degree / Qualifications (unchanged) */}
                        <div>
                            <label htmlFor="qualifications" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="qualifications" name="qualifications" value={newInstructor.qualifications} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required >
                                {qualificationOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        {/* Address Field (unchanged) */}
                        <div className="col-span-2">
                            <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input id="address" name="address" value={newInstructor.address} onChange={handleInputChange} rows="3" className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="123 Main Street, City, Country" required />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Create Instructor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreatePopup;