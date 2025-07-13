'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

// Shift mapping to convert display names to IDs
const shiftMap = {
    'Morning Shift (07:00:00 - 10:00:00, Weekday)': 1,
    'Noon Shift (10:30:00 - 13:30:00, Weekday)': 2,
    'Afternoon Shift (14:00:00 - 17:00:00, Weekday)': 3,
    'Evening Shift (17:30:00 - 20:30:00, Weekday)': 4,
    'Weekend Shift (07:30:00 - 17:00:00, Weekend)': 5
};

const ClassCreatePopup = ({ isOpen, onClose, onSave, departments, departmentsError }) => {
    // --- State and Options ---
    const generationOptions = ['30', '31', '32', '33', '34', '35'];
    const degreesOptions = ['Bachelor', 'Master', 'PhD', 'Doctor'];
    const semesterOptions = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
    const shiftOptions = Object.keys(shiftMap);
    const popupRef = useRef(null);

    // Use the fetched department names for the Major dropdown options
    const majorOptions = useMemo(() => {
        if (!departments) return [];
        return departments.map(dep => dep.name);
    }, [departments]);

    // Function to get the initial state for the form
    const getInitialState = () => ({
        className: '',
        generation: generationOptions[0],
        groupName: '',
        major: majorOptions[0] || '', // Default to the first major/department name
        degree: degreesOptions[0],
        semester: semesterOptions[0],
        departmentId: departments?.[0]?.departmentId || '', // Default to the first department ID
        shiftId: shiftMap[shiftOptions[0]] || 1,
        // Default values as per API requirements
        year: 1,
        day: 'Monday',
    });

    const [newClass, setNewClass] = useState(getInitialState());

    // Effect to reset form state when departments load or when the popup opens
    useEffect(() => {
        if (isOpen) {
            setNewClass(getInitialState());
        }
    }, [isOpen, departments]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClass(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Construct the payload for the API from the current state
        const payload = {
            className: newClass.className || `NUM${newClass.generation}-${newClass.groupName}`,
            generation: newClass.generation,
            groupName: newClass.groupName,
            major: newClass.major,
            degree: newClass.degree,
            semester: newClass.semester,
            day: newClass.day,
            year: Number(newClass.year),
            departmentId: Number(newClass.departmentId),
            shiftId: Number(newClass.shiftId),
        };

        // Basic validation
        if (!payload.groupName) {
            alert('Please provide a Group name.');
            return;
        }
        if (!payload.departmentId) {
            alert('Please select a department.');
            return;
        }
        if (!payload.shiftId) {
            alert('Please select a shift.');
            return;
        }

        onSave(payload); // onSave is the function passed from ClassClientView
        onClose(); // Close the popup after saving
    };

    // Effect to handle clicks outside the popup to close it
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
                <h2 className="text-mb font-bold mb-3">Create New Class</h2>
                <hr className="border-t-2 border-gray-200 mb-5" />
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 mb-16">
                        <div className="col-span-2">
                            <label htmlFor="className" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Name (Optional)</label>
                            <input
                                type="text"
                                id="className"
                                name="className"
                                value={newClass.className}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Auto-generates if empty (e.g., NUM30-01)"
                            />
                        </div>

                        <div>
                            <label htmlFor="generation" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Generation</label>
                            <select id="generation" name="generation" value={newClass.generation} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {generationOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="groupName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <input type="text" id="groupName" name="groupName" value={newClass.groupName} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="01" required />
                        </div>
                        <div>
                            <label htmlFor="degree" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Degree</label>
                            <select id="degree" name="degree" value={newClass.degree} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {degreesOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="major" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Major</label>
                            <select id="major" name="major" value={newClass.major} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {departmentsError && <option value="">Error loading majors</option>}
                                {!departments && !departmentsError && <option value="">Loading...</option>}
                                {majorOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="semester" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Semester</label>
                            <select id="semester" name="semester" value={newClass.semester} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {semesterOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="departmentId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Department</label>
                            <select id="departmentId" name="departmentId" value={newClass.departmentId} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {departmentsError && <option value="">Error loading departments</option>}
                                {!departments && !departmentsError && <option value="">Loading...</option>}
                                {departments && departments.map(dep => (<option key={dep.departmentId} value={dep.departmentId}>{dep.name}</option>))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="shiftId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Shift</label>
                            <select id="shiftId" name="shiftId" value={newClass.shiftId} onChange={handleInputChange} className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                {shiftOptions.map(shiftName => (<option key={shiftMap[shiftName]} value={shiftMap[shiftName]}>{shiftName}</option>))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Create Class</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassCreatePopup;