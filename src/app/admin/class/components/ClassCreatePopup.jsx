// components/ClassCreatePopup.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ClassCreatePopup = ({ isOpen, onClose, onSave }) => {
    // Define options for select fields
    const generationOptions = ['30', '31', '32', '33', '34', '35'];
    const majorOptions = ['IT', 'CS', 'IS', 'SE', 'AI', 'DS', 'ML', 'DA'];
    const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
    const facultyOptions = ['Faculty of IT', 'Faculty of CS', 'Faculty of IS', 'Faculty of AI', 'Faculty of DS', 'Faculty of ML', 'Faculty of DA', 'Faculty of SE']; // Example faculties
    const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6']; // Example semesters
    const shiftOptions = ['7:00 - 10:00', '8:00 - 11:00', '9:00 - 12:00', '13:00 - 16:00', '15:00 - 18:00', '17:00 - 20:00', '18:00 - 21:00', '19:00 - 22:00']; // Example shifts

    // State to manage the form fields for the new class
    const [newClass, setNewClass] = useState({
        name: '',
        generation: generationOptions[0], // Default to first option
        group: '',
        major: majorOptions[0],           // Default to first option
        degrees: degreesOptions[0],       // Default to first option
        faculty: facultyOptions[0],       // Default to first option
        semester: semesterOptions[0],     // Default to first option
        shift: shiftOptions[0],           // Default to first option
    });

    // Create a ref to store the DOM element of the popup content
    const popupRef = useRef(null);

    // Handle changes to form input/select fields
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

        let classDataToSave = { ...newClass };

        // --- Name Auto-Generation Logic ---
        if (!classDataToSave.name.trim()) { // If name is empty or just whitespace
            // Ensure generation and group are available for auto-generation
            if (!classDataToSave.generation || !classDataToSave.group.trim()) {
                alert('Please provide a Class Name, or both Generation and Group to auto-generate the name (e.g., NUM30-01).');
                return;
            }
            classDataToSave.name = `NUM${classDataToSave.generation}-${classDataToSave.group}`;
        }

        // --- Basic Validation for 'Group' (which is still a text input) ---
        if (!classDataToSave.group.trim()) {
            alert('Please provide a Group.');
            return;
        }

        // For select fields, a default value is always selected,
        // so no explicit empty string check is needed here if default options are set.
        // The 'required' attribute on the select elements helps with browser-level validation.

        // Call the onSave prop with the processed class data
        onSave(classDataToSave);

        // Reset the form fields after saving to their initial default values
        setNewClass({
            name: '',
            generation: generationOptions[0],
            group: '',
            major: majorOptions[0],
            degrees: degreesOptions[0],
            faculty: facultyOptions[0],
            semester: semesterOptions[0],
            shift: shiftOptions[0],
        });

        // Close the modal
        onClose();
    };

    // Effect to handle clicks outside the popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the modal is open and the click is outside the popup content
            if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
                onClose(); // Close the modal
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
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-mb font-bold mb-3">Create New Class</h2>
                <hr className="border-t-2 border-gray-200 mb-5" />
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Removed mb-20 from here to prevent excessive bottom margin */}
                    <div className="grid grid-cols-2 gap-3 mb-16">
                        <div className="col-span-2">
                            <label htmlFor="name" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name (Optional, will auto-generate if empty)</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newClass.name}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="e.g., NUM30-01 or your custom name"
                            />
                        </div>

                        <div>
                            <label htmlFor="generation" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Generation</label>
                            <select
                                id="generation"
                                name="generation"
                                value={newClass.generation}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required // Select fields are required to ensure a value is chosen
                            >
                                {generationOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="group" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <input
                                type="text"
                                id="group"
                                name="group"
                                value={newClass.group}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="01"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="degrees" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Degrees</label>
                            <select
                                id="degrees"
                                name="degrees"
                                value={newClass.degrees}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {degreesOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="major" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select
                                id="major"
                                name="major"
                                value={newClass.major}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {majorOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="semester" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Semester</label>
                            <select
                                id="semester"
                                name="semester"
                                value={newClass.semester}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {semesterOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="faculty" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Faculty</label>
                            <select
                                id="faculty"
                                name="faculty"
                                value={newClass.faculty}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {facultyOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="shift" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Shift</label>
                            <select
                                id="shift"
                                name="shift"
                                value={newClass.shift}
                                onChange={handleInputChange}
                                className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {shiftOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
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
                            Create Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassCreatePopup;