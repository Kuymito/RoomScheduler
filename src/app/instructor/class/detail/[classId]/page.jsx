// app/instructor/class/detail/[classId]/page.jsx
'use client';

import InstructorLayout from '@/components/InstructorLayout';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook to access dynamic route parameters
import Image from 'next/image'; // Image component is needed for avatars

const ClassDetailContent = () => {
    const params = useParams();
    const classId = decodeURIComponent(params.classId);

    // Dummy data for all class details (in a real application, this would come from an API call)
    const allClassDetails = [
        {
            name: 'NUM34/27',
            generation: '34', group: '27', faculty: 'Faculty of IT', degree: 'Bachelor', major: 'Information Technology',
            semester: '1', shift: '07:00 - 10:00', status: 'Active',
            schedule: {
                Monday: { status: 'In Class', instructor: 'Dr. Linda Keo', title: 'Doctor', avatar: '/images/admin.jpg' },
                Tuesday: { status: 'In Class', instructor: 'Dr. Anthony Chea', title: 'Doctor', avatar: 'https://randomuser.me/api/portraits/men/78.jpg' },
                Wednesday: { status: 'In Class', instructor: 'Mr. Alex Chan', title: 'Master', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
                Thursday: { status: 'Online', instructor: 'Dr. Sokunthy Lim', title: 'Doctor', avatar: 'https://randomuser.me/api/portraits/women/60.jpg' },
                Friday: { status: 'Online', instructor: 'Dr. Anthony Chea', title: 'Doctor', avatar: 'https://randomuser.me/api/portraits/men/78.jpg' },
                Saturday: { status: 'No Class', instructor: '', title: '', avatar: '' },
                Sunday: { status: 'No Class', instructor: '', title: '', avatar: '' },
            },
            publicDate: '2025-06-22 13:11:46'
        },
        {
            name: 'NUM32/12',
            generation: '32', group: '12', faculty: 'Faculty of MG', degree: 'Master', major: 'Information Technology',
            semester: '3', shift: '10:30 - 13:30', status: 'Inactive',
            schedule: {
                Monday: { status: 'Online', instructor: 'Dr. Sophanith', title: 'Master', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
                Tuesday: { status: 'Online', instructor: 'Ms. SreyLeak', title: 'Master', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
                Wednesday: { status: 'In Class', instructor: 'Mr. Dara', title: 'Doctor', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
                Thursday: { status: 'No Class', instructor: '', title: '', avatar: '' },
                Friday: { status: 'No Class', instructor: '', title: '', avatar: '' },
                Saturday: { status: 'No Class', instructor: '', title: '', avatar: '' },
                Sunday: { status: 'No Class', instructor: '', title: '', avatar: '' },
            },
            publicDate: '2025-06-20 10:00:00'
        },
    ];

    const [classDetail, setClassDetail] = useState(null);

    useEffect(() => {
        const foundClass = allClassDetails.find(cls => cls.name === classId);
        setClassDetail(foundClass);
    }, [classId]);

    if (!classDetail) {
        return (
            <InstructorLayout pageTitle="Class Detail">
                <div className="p-6 text-black">Loading class details...</div>
            </InstructorLayout>
        );
    }

    // Helper function to render each day's schedule card, updated to match image_f521f5.png
    const renderScheduleCard = (day, scheduleInfo) => (
        <div key={day} className={`rounded-lg shadow-sm flex flex-col items-center text-center overflow-hidden`}>
            {/* Top part: Day and Status */}
            <div className={`w-full p-4 rounded-t-lg
                ${scheduleInfo.status === 'In Class' ? 'bg-green-50 text-green-700' : // Retain bg colors for top box
                   scheduleInfo.status === 'Online' ? 'bg-yellow-50 text-yellow-700' :
                   'bg-gray-50 text-gray-500'}`}>
                <p className="font-semibold text-lg mb-2">{day}</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full
                    ${scheduleInfo.status === 'In Class' ? 'bg-green-200 text-green-800' : // Background for the status pill
                       scheduleInfo.status === 'Online' ? 'bg-yellow-200 text-yellow-800' :
                       'bg-gray-200 text-gray-800'}`}>
                    {scheduleInfo.status}
                </span>
            </div>

            {/* Bottom part: Instructor details (conditionally rendered) */}
            {scheduleInfo.instructor ? ( // Conditionally render if instructor exists
                <div className={`w-full p-4 bg-white rounded-b-lg flex flex-col items-center text-center
                    ${scheduleInfo.status === 'In Class' ? 'border-t-2 border-green-500' : // Green border for In Class
                       scheduleInfo.status === 'Online' ? 'border-t-2 border-yellow-500' : // Yellow border for Online
                       'border-t-2 border-gray-300'}`}> {/* Grey border for No Class/other */}
                    <Image
                        src={scheduleInfo.avatar || '/images/default-avatar.png'} // Use a default avatar if none specified
                        alt={scheduleInfo.instructor}
                        width={40}
                        height={40}
                        className="rounded-full object-cover mb-1"
                    />
                    <p className="text-md font-semibold text-black">{scheduleInfo.instructor}</p>
                    <p className="text-xs text-gray-500">{scheduleInfo.title}</p>
                </div>
            ) : ( // Render an empty box for days with no instructor (No Class)
                <div className={`w-full p-4 bg-white rounded-b-lg flex-grow border-t-2 border-gray-300`}>
                    {/* Empty space for days without instructors, maintaining height */}
                </div>
            )}
        </div>
    );

    return (
        <InstructorLayout activeItem="class" pageTitle="Class / Class Detail">
            <div className="p-6 dark:text-white bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {/* Class Information Section */}
                <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 text-black dark:text-white">
                    <div className="col-span-full">
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Name</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.name}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Generation</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.generation}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Group</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.group}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Faculty</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.faculty}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Degree</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.degree}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Major</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.major}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Semester</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.semester}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Shift</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.shift}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Status</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner text-gray-900 dark:text-white">
                            {classDetail.status}
                        </div>
                    </div>
                </div>

                {/* Schedule Class Section */}
                <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Schedule Class</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                    {Object.entries(classDetail.schedule).map(([day, info]) => renderScheduleCard(day, info))}
                </div>

                {/* Bottom Details and Download Button */}
                <div className="flex justify-between items-end flex-wrap gap-4 text-black dark:text-white">
                    <div className="text-sm">
                        <p className="mb-1"><span className="font-medium">Generation</span> : {classDetail.generation}</p>
                        <p className="mb-1"><span className="font-medium">Group</span> : {classDetail.group}</p>
                        <p className="mb-1"><span className="font-medium">Semester</span> : {classDetail.semester}</p>
                        <p className="mb-1"><span className="font-medium">Shift</span> : {classDetail.shift}</p>
                        <p className="mt-4"><span className="font-medium">Public Date</span>: {classDetail.publicDate}</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download PDF file
                    </button>
                </div>
            </div>
        </InstructorLayout>
    );
};

export default ClassDetailContent;