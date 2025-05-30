// components/ClassCreatePopup.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ClassCreatePopup = ({ isOpen, onClose, onSave }) => {
    // State to manage the form fields for the new class
    const [newClass, setNewClass] = useState({
        name: '',
        generation: '',
        group: '',
        major: '',
        degrees: '',
        faculty: '',
        semester: '', // <--- Added semester here
        shift: '',
    });

    // Create a ref to store the DOM element of the popup content
    const popupRef = useRef(null);

    // Handle changes to form input fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClass(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Basic validation: check if all fields are filled, including semester
        if (!newClass.name || !newClass.generation || !newClass.group || !newClass.major || !newClass.degrees || !newClass.faculty || !newClass.semester || !newClass.shift) {
            alert('Please fill in all fields.'); // Using alert as per previous instruction
            return;
        }

        // Call the onSave prop with the new class data
        onSave(newClass);

        // Reset the form fields after saving
        setNewClass({
            name: '',
            generation: '',
            group: '',
            major: '',
            degrees: '',
            faculty: '',
            semester: '', // <--- Reset semester here
            shift: '',
        });

        // Close the modal
        onClose();
    };

    // Effect to handle clicks outside the popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the popup is open and the click is outside the popup content
            if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
                onClose(); // Close the popup
            }
        };

        // Add event listener when the component mounts or when isOpen changes to true
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up the event listener when the component unmounts or when isOpen changes to false
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]); // Re-run effect if isOpen or onClose changes

    // If the modal is not open, return null to render nothing
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* Attach the ref to the inner div which represents the actual popup content */}
            <div ref={popupRef} className="relative p-6 bg-white rounded-lg shadow-lg max-w-xl w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Class</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-20">
                        <div className="col-span-2">
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newClass.name}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="NUM30-01"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="generation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generation</label>
                            <input
                                type="text"
                                id="generation"
                                name="generation"
                                value={newClass.generation}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="30"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <input
                                type="text"
                                id="group"
                                name="group"
                                value={newClass.group}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="01"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="degrees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Degrees</label>
                            <input
                                type="text"
                                id="degrees"
                                name="degrees"
                                value={newClass.degrees}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Bachelor"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <input
                                type="text"
                                id="major"
                                name="major"
                                value={newClass.major}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="IT"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label> {/* <--- Corrected htmlFor */}
                            <input
                                type="text"
                                id="semester" // <--- Corrected id
                                name="semester" // <--- Corrected name
                                value={newClass.semester} // <--- Corrected value
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="2024-2025 Semester 1"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Faculty</label>
                            <input
                                type="text"
                                id="faculty" // <--- Now unique and correct for faculty
                                name="faculty" // <--- Now unique and correct for faculty
                                value={newClass.faculty} // <--- Still newClass.faculty
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Faculty of IT"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift</label>
                            <input
                                type="text"
                                id="shift"
                                name="shift"
                                value={newClass.shift}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="7:00 - 10:00"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Create Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassCreatePopup;