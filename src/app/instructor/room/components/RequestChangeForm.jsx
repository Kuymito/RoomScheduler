"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/services/notification.service';
import Toast from '@/components/Toast'; // Import the new Toast component

// --- Helper function to get the next date for a given weekday ---
const getNextDateForDay = (day) => {
    const dayIndexMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 };
    const targetDayIndex = dayIndexMap[day];
    if (targetDayIndex === undefined) return new Date();

    const today = new Date();
    const currentDayIndex = today.getDay();
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) {
        diff += 7;
    }
    today.setDate(today.getDate() + diff);
    return today;
};

// --- Custom Calendar Component ---
const CustomDatePicker = ({ selectedDate, onDateChange, minDate, maxDate, allowedDayIndex }) => {
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
        if (maxDate && newDate > maxDate) {
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
                    const isBeforeMin = minDate && date < minDate && !isSameDay(date, minDate);
                    const isAfterMax = maxDate && date > maxDate;
                    
                    const isWrongDay = allowedDayIndex !== undefined && date.getDay() !== allowedDayIndex;

                    const isDisabled = isBeforeMin || isAfterMax || isWrongDay;

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
                                    ${isDisabled ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-200'}
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
    
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);

    const conferenceRoomIds = [10, 34];
    const isConferenceRoom = roomDetails && conferenceRoomIds.includes(roomDetails.id);

    const getInitialState = () => ({
        scheduleId: isConferenceRoom ? null : (instructorClasses && instructorClasses.length > 0 ? instructorClasses[0].id : ''),
        eventName: '',
        date: getNextDateForDay(selectedDay),
        description: '',
    });

    const [requestData, setRequestData] = useState(getInitialState());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const popupRef = useRef(null);
    
    const dayIndexMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 };
    const allowedDayIndex = dayIndexMap[selectedDay];

    useEffect(() => {
        if (isOpen) {
            setRequestData(getInitialState());
            setIsSubmitting(false);
            setToast({ show: false, message: '', type: 'info' });
        }
    }, [isOpen, instructorClasses, selectedDay, roomDetails]);

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
        
        if (isConferenceRoom) {
            if (!requestData.eventName.trim()) {
                setToast({ show: true, message: 'Please enter an event name.', type: 'error' });
                return;
            }
        } else {
            if (!requestData.scheduleId) {
                setToast({ show: true, message: 'Please select a class.', type: 'error' });
                return;
            }
        }

        if (!requestData.date || !roomDetails?.id) {
            setToast({ show: true, message: 'A valid date and room are required.', type: 'error' });
            return;
        }
    
        setIsSubmitting(true);
        try {
            const payload = {
                scheduleId: isConferenceRoom ? null : Number(requestData.scheduleId),
                newRoomId: Number(roomDetails.id),
                effectiveDate: requestData.date.toISOString().split('T')[0],
                description: requestData.description || '',
                eventName: isConferenceRoom ? requestData.eventName : undefined,
            };
    
            await onSave(payload);
            
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatShift = (shiftString) => {
        if (!shiftString) return 'Time not specified';
        try {
            const [start, end] = shiftString.split('-');
            return `${start.substring(0, 5)}-${end.substring(0, 5)}`;
        } catch (e) {
            return shiftString;
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
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <div ref={popupRef} className="relative p-5 bg-white rounded-lg shadow-lg max-w-lg w-full dark:bg-gray-800 dark:text-white">
                <h2 className="text-xl font-bold mb-4">
                    {isConferenceRoom ? 'Confirm Room Booking' : 'Confirm Room Change Request'}
                </h2>
                <hr className="border-t border-gray-200 mt-4 mb-4" />
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Room</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {roomDetails?.building} - {roomDetails?.name} ({isConferenceRoom ? 'Conference' : roomDetails?.type})
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Requested Slot</label>
                            <div className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {selectedDay}, {selectedTime}
                            </div>
                        </div>

                        {isConferenceRoom ? (
                            <div>
                                <label htmlFor="eventName" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Event Name</label>
                                <input
                                    type="text"
                                    id="eventName"
                                    name="eventName"
                                    value={requestData.eventName}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g., Department Meeting"
                                    required
                                />
                            </div>
                        ) : (
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
                                    {instructorClasses.length > 0 ? (
                                        instructorClasses.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name} - {formatShift(cls.shift)}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No classes available</option>
                                    )}
                                </select>
                            </div>
                        )}

                        <div className="relative">
                            <label htmlFor="date" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                                {isConferenceRoom ? 'Date of Event' : 'Date of Change'}
                            </label>
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
                                    maxDate={maxDate}
                                    allowedDayIndex={allowedDayIndex}
                                />
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block mb-2 text-xs font-medium text-gray-900 dark:text-white">
                                Description <span className="text-gray-500 dark:text-white">(Optional)</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={requestData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Provide any additional details..."
                                maxLength={150}
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
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : (isConferenceRoom ? 'Submit Booking' : 'Submit Request')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default RequestChangeForm;