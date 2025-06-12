"use client";

import React, { useState, useRef, useEffect } from 'react';

// --- Helper function to get the next date for a given weekday ---
// It calculates the nearest future date for a day like "Mon", "Tue", etc.
const getNextDateForDay = (day) => {
    // Mapping for weekdays used in the filter and their corresponding JS Day index
    const dayIndexMap = { "Mon": 1, "Tue": 2, "Wed": 3, "Thur": 4, "Fri": 5, "Sat": 6, "Sun": 0 };
    const targetDayIndex = dayIndexMap[day];

    // If the mapping is invalid, return an empty string
    if (targetDayIndex === undefined) return "";

    const today = new Date();
    const currentDayIndex = today.getDay();
    
    // Calculate the difference in days
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) {
        diff += 7; // Ensure it's always in the future
    }
    
    today.setDate(today.getDate() + diff);
    
    // Return date in YYYY-MM-DD format for the input field
    return today.toISOString().split('T')[0];
};


const RequestChangeForm = ({ isOpen, onClose, onSave, roomDetails, instructorClasses, selectedDay, selectedTime }) => {
    
    // Get today's date to prevent selecting past dates
    const today = new Date().toISOString().split('T')[0];

    // Initial state for the form fields
    const getInitialState = () => ({
        classId: instructorClasses[0]?.id || '', 
        // Auto-calculate the date based on the selected day from the main screen
        date: getNextDateForDay(selectedDay),
        description: '',
    });

    const [requestData, setRequestData] = useState(getInitialState());
    const popupRef = useRef(null);

    // Effect to reset form state when it's opened or the context changes
    useEffect(() => {
        if (isOpen) {
            setRequestData(getInitialState());
        }
    }, [isOpen, instructorClasses, selectedDay, selectedTime]); // Dependencies ensure state is fresh


    // Handle input changes for date and description
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation for class and date
        if (!requestData.classId || !requestData.date) {
            alert('Please select a class and a valid date.');
            return;
        }
        // Pass all relevant data up, including the time slot
        onSave({ ...requestData, timeSlot: selectedTime, room: roomDetails });
        onClose(); // Close the form after saving
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Confirm Room Change Request</h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    {/* Use a single-column layout for better readability */}
                    <div className="space-y-4 mb-6">
                        {/* Display Room Details */}
                        <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Room</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {roomDetails?.building} - {roomDetails?.name}
                            </div>
                        </div>

                         {/* Display Selected Day and Time */}
                         <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Requested Slot</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {selectedDay}, {selectedTime}
                            </div>
                        </div>

                        {/* Select Class */}
                        <div>
                            <label htmlFor="classId" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Assign to Class</label>
                            <select
                                id="classId"
                                name="classId"
                                value={requestData.classId}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {instructorClasses.length > 0 ? (
                                    instructorClasses.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No classes found</option>
                                )}
                            </select>
                        </div>

                        {/* Date Picker (Auto-filled) */}
                        <div>
                            <label htmlFor="date" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Date of Change</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={requestData.date}
                                onChange={handleInputChange}
                                min={today} // Prevent selecting past dates
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>

                        {/* Optional Description */}
                        <div>
                            <label htmlFor="description" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                                Description <span className="text-gray-500">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={requestData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Provide any additional details..."
                            ></textarea>
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
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestChangeForm;