'use client';

import React, { useState, useRef, useEffect } from 'react';

const InstructorCreatePopup = ({ isOpen, onClose, onSave }) => {
    // Define options for select fields
    const majorStudiedOptions = [
        'Computer Science', 'Information Technology', 'Information Systems',
        'Software Engineering', 'Artificial Intelligence', 'Data Science',
        'Machine Learning', 'Data Analytics', 'Robotics'
    ];
    const qualificationOptions = [
        'Bachelor', 'Master', 'PhD', 'Professor', 'Associate Professor', 'Lecturer'
    ];

    // State to manage the form fields for the new instructor
    const [newInstructor, setNewInstructor] = useState({
        firstName: '', // Separated first name
        lastName: '',  // Separated last name
        email: '',
        phone: '',
        majorStudied: majorStudiedOptions[0], // Changed from 'department'
        qualifications: qualificationOptions[0],
        address: '', // Added address field
        profileImage: null,
    });

    // State for image preview
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // Create refs for popup content and file input
    const popupRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

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
                    profileImage: reader.result,
                }));
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setNewInstructor(prev => ({
                ...prev,
                profileImage: null,
            }));
            setImagePreviewUrl(null);
        }
    };

    // Function to trigger click on hidden file input
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Combine first and last name for the 'name' property
        const fullName = `${newInstructor.firstName.trim()} ${newInstructor.lastName.trim()}`;

        // Basic validation
        if (!newInstructor.firstName.trim() || !newInstructor.lastName.trim() || !newInstructor.email.trim() || !newInstructor.phone.trim() || !newInstructor.majorStudied || !newInstructor.qualifications || !newInstructor.address.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        // Pass the combined name along with other data
        onSave({ ...newInstructor, name: fullName });

        // Reset the form fields after saving
        setNewInstructor({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            majorStudied: majorStudiedOptions[0],
            qualifications: qualificationOptions[0],
            address: '', // Reset address field
            profileImage: null,
        });
        setImagePreviewUrl(null); // Reset image preview as well

        onClose();
    };

    // Effect to handle clicks outside the popup (remains unchanged)
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
                    {/* Photo Upload Section */}
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
                        {/* Dynamic Button Text */}
                        <button
                            type="button"
                            onClick={handleButtonClick}
                            className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                        >
                            {imagePreviewUrl ? 'Change Photo' : 'Upload Photo'} {/* <-- HERE IS THE CHANGE */}
                        </button>
                        {/* Delete button */}
                        {imagePreviewUrl && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewInstructor(prev => ({
                                        ...prev,
                                        profileImage: null,
                                    }));
                                    setImagePreviewUrl(null);
                                }}
                                className="rounded-md text-red-500 text-sm font-semibold hover:text-red-600 dark:text-red-700 dark:hover:text-red-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>

                            </button>
                        )}
                        {/* Hidden file input */}
                        <input
                            type="file"
                            id="profileImage"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="sr-only"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3   mb-16">
                        <div>
                            <label htmlFor="firstName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={newInstructor.firstName}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={newInstructor.lastName}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={newInstructor.email}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={newInstructor.phone}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="+855 12 345 678"
                                required
                            />
                        </div>
                        {/* Major Studied and Qualifications in a grid */}
                        <div>
                            <label htmlFor="majorStudied" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select
                                id="majorStudied"
                                name="majorStudied"
                                value={newInstructor.majorStudied}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            >
                                {majorStudiedOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="qualifications" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select
                                id="qualifications"
                                name="qualifications"
                                value={newInstructor.qualifications}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            >
                                {qualificationOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        {/* Address Field */}
                        <div className="col-span-2">
                            <label htmlFor="address" className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input
                                id="address"
                                name="address"
                                value={newInstructor.address}
                                onChange={handleInputChange}
                                rows="3" // Adjust rows as needed
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="123 Main Street, City, Country"
                                required
                            ></input>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Create Instructor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreatePopup;