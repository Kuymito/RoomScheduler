'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import InstructorLayout from '@/components/InstructorLayout';

// Mock options, in a real app, these might come from an API
const generationOptions = ['30', '31', '32', '33', '34', '35'];
const majorOptions = ['Information Technology', 'Computer Science', 'Information Systems', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Machine Learning', 'Data Analytics'];
const degreesOptions = ['Associate', 'Bachelor', 'Master', 'PhD'];
const facultyOptions = ['Faculty of Engineering', 'Faculty of Science and Technology'];
const shiftOptions = [
    { id: 'ca1a9425-c6be-4e1b-a0a4-37f26d691c28', time: '07:00:00 - 08:30:00' },
    { id: 'ca1a9425-c6be-4e1b-a0a4-37f26d691c29', time: '08:45:00 - 10:15:00' },
    { id: 'ca1a9425-c6be-4e1b-a0a4-37f26d691c30', time: '10:30:00 - 12:00:00' }
];

const InstructorClassDetailsContent = () => {
    const params = useParams();
    const classId = params.classId;

    const [classDetails, setClassDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch class details from API
    const fetchClassDetails = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://jaybird-new-previously.ngrok-free.app/api/v1/class/${id}`, {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch class details');
            }

            const data = await response.json();
            const classItem = data.payload;

            // Map API data to the state format
            const mappedData = {
                id: classItem.classId,
                name: classItem.className,
                generation: classItem.generation,
                group: classItem.groupName,
                major: classItem.majorName,
                degrees: classItem.degreeName,
                faculty: classItem.department?.name || 'N/A',
                shift: `${classItem.shift?.startTime} - ${classItem.shift?.endTime}`,
                shiftId: classItem.shift?.shiftId,
                status: classItem.status,
            };
            setClassDetails(mappedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        if (classId) {
            fetchClassDetails(classId);
        }
    }, [classId, fetchClassDetails]);


    if (loading && !classDetails) {
        return <div className="p-6 dark:text-white">Loading class details...</div>;
    }

    if (error && !classDetails) {
        return <div className="p-6 text-red-500 dark:text-red-400">Error: {error}</div>;
    }
    
    // The component is now always in a read-only state
    const currentData = classDetails;

    // Generic function to render a field as read-only
    const renderField = (label, value) => (
        <div className="form-group flex-1 min-w-[200px]">
            <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">{label}</label>
            <input type="text" value={value} readOnly className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-[14px] text-gray-500 dark:text-gray-400" />
        </div>
    );

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Class Details</div>
            <hr className="border-t border-gray-200 mt-4 mb-8" />

            {currentData && (
                <div className="class-section flex gap-8 mb-4 flex-wrap">
                    <div className="info-details-wrapper flex-grow flex flex-col gap-8 min-w-[300px]">
                        <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
                            <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">General Information</div>
                            <div className="form-row flex gap-3 mb-2 flex-wrap">
                                {renderField("Class Name", currentData.name)}
                                {renderField("Group", currentData.group)}
                            </div>
                            <div className="form-row flex gap-3 mb-2 flex-wrap">
                                {renderField("Generation", currentData.generation)}
                                {renderField("Major", currentData.major)}
                            </div>
                            <div className="form-row flex gap-3 mb-2 flex-wrap">
                                {renderField("Degrees", currentData.degrees)}
                                {renderField("Faculty", currentData.faculty)}
                            </div>
                            <div className="form-row flex gap-3 mb-2 flex-wrap">
                                 {renderField("Shift", currentData.shift)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function InstructorClassDetailsPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class Details">
            <InstructorClassDetailsContent />
        </InstructorLayout>
    );
}