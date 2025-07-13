// src/app/instructor/room/components/RequestChangeForm.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/services/notification.service';

// --- Custom Calendar Component ---
const CustomDatePicker = ({ selectedDate, onDateChange, minDate }) => {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());

    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startingDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = Array.from({ length: startingDay + daysInMonth }, (_, i) => {
        if (i < startingDay) return null;
        return i - startingDay + 1;
    });

    const isSameDay = (d1, d2) =>
        d1 && d2 &&
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (minDate && newDate < minDate && !isSameDay(newDate, minDate)) {
            return;
        }
        onDateChange(newDate);
    };

    const today = new Date();

    return (
        <div className="absolute top-full left-0 mt-2 z-10 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={index}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-2">
                {days.map((day, index) => {
                    if (!day) return <div key={index}></div>;
                    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const isDisabled = minDate && date < minDate && !isSameDay(date, minDate);
                    return (
                        <div key={index} className="flex justify-center items-center">
                            <button
                                type="button"
                                onClick={() => handleDayClick(day)}
                                disabled={isDisabled}
                                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                                    ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                                    ${!isSelected && isToday ? 'text-blue-600 font-semibold' : ''}
                                    ${!isSelected && !isDisabled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                                    ${isDisabled ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200'}
                                `}
                            >
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main Request Change Form Component ---
const RequestChangeForm = ({ isOpen, onClose, onSave, roomDetails, instructorClasses, selectedDay, selectedTime }) => {
    const { data: session } = useSession();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getInitialState = () => ({
        scheduleId: instructorClasses && instructorClasses.length > 0 ? instructorClasses[0].id : '',
        date: new Date(),
        description: '',
    });

    const renderClassOptions = () => {
        if (!instructorClasses || instructorClasses.length === 0) {
            return <option value="">No classes available</option>;
        }

        return instructorClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
                {cls.name} - {formatShift(cls.shift)}
            </option>
        ));
    };

    const [requestData, setRequestData] = useState(getInitialState());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const popupRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setRequestData(getInitialState());
        }
    }, [isOpen, instructorClasses]);

    const handleDateChange = (newDate) => {
        setRequestData(prev => ({ ...prev, date: newDate }));
        setIsCalendarOpen(false);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!requestData.scheduleId || !requestData.date || !roomDetails?.id) {
            alert('Please select a class and valid date');
            return;
        }
    
        try {
            // Debug: Log the full session data
            console.log("Full session data:", session);
            
            // Get instructor ID from session - ensure we're accessing the correct path
            const instructorId = session?.user?.id;
            
            if (!instructorId) {
                throw new Error(`Instructor ID not found in session. Session structure: ${JSON.stringify(session)}`);
            }
    
            // Create payload with proper numeric IDs
            const payload = {
                instructorId: Number(instructorId),
                scheduleId: Number(requestData.scheduleId),
                newRoomId: Number(roomDetails.id),
                effectiveDate: requestData.date.toISOString().split('T')[0],
                description: requestData.description || '',
            };
    
            console.log("Submitting payload:", payload);
            
            await notificationService.submitChangeRequest(payload, session.accessToken);
            
            onSave(payload);
            onClose();
            
        } catch (error) {
            console.error('Submission failed:', {
                error: error.message,
                sessionUser: session?.user,
                stack: error.stack
            });
            alert(`Submission failed: ${error.message}`);
        }
    };

    // Format the day of week from the schedule data
    const formatDayOfWeek = (dayDetails) => {
        if (!dayDetails || !Array.isArray(dayDetails) || dayDetails.length === 0) return 'N/A';
        return dayDetails[0].dayOfWeek.toLowerCase().replace(/_/g, ' ');
    };

    // Format the time range from shift data
    const formatTimeRange = (shift) => {
        if (!shift || !shift.startTime || !shift.endTime) return 'N/A';
        const start = shift.startTime.substring(0, 5);
        const end = shift.endTime.substring(0, 5);
        return `${start}-${end}`;
    };

    const formatShift = (shiftString) => {
        if (!shiftString) return 'Time not specified';
        
        try {
            // Handle "07:00:00-10:00:00" format
            const [start, end] = shiftString.split('-');
            return `${start.substring(0, 5)}-${end.substring(0, 5)}`;
        } catch (e) {
            console.error('Error formatting shift:', e);
            return shiftString; // Return original if formatting fails
        }
    };

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
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Room</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {roomDetails?.building} - {roomDetails?.name}
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Requested Slot</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {selectedDay}, {selectedTime}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="scheduleId" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Assign to Class</label>
                            <select
                                id="scheduleId"
                                name="scheduleId"
                                value={requestData.scheduleId}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                <option value="" disabled>Select a class</option>
                                {renderClassOptions()}
                            </select>
                        </div>

                        {/* Rest of the form remains the same */}
                        <div className="relative">
                            <label htmlFor="date" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Date of Change</label>
                            <button
                                type="button"
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left"
                            >
                               {requestData.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </button>
                            {isCalendarOpen && (
                                <CustomDatePicker
                                    selectedDate={requestData.date}
                                    onDateChange={handleDateChange}
                                    minDate={today}
                                />
                            )}
                        </div>

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
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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