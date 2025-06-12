'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InstructorLayout from '@/components/InstructorLayout';
import InstructorClassDetailSkeleton from '../components/InstructorClassDetailSkeleton';

// --- MOCK DATA (for demonstration) ---
const mockClassData = {
    id: 1,
    name: '34/27',
    generation: '34',
    group: '27',
    major: 'Information Technology',
    degrees: 'Bachelor',
    faculty: 'Faculty of IT',
    shift: '07:00 - 10:00',
    status: 'Active',
    semester: '1',
};

const mockScheduleData = {
    Monday: { instructor: { name: 'Dr. Linda Keo', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'In-Class' },
    Tuesday: { instructor: { name: 'Dr. Anthony Chea', role: 'Doctor', avatar: '/images/kok.png' }, studyMode: 'In-Class' },
    Wednesday: { instructor: { name: 'Mr. Alex Chan', role: 'Master', avatar: '/images/admin.jpg' }, studyMode: 'In-Class' },
    Thursday: { instructor: { name: 'Dr. Sokunthy Lim', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'Online' },
    Friday: { instructor: { name: 'Dr. Anthony Chea', role: 'Doctor', avatar: '/images/admin.jpg' }, studyMode: 'Online' },
    Saturday: null,
    Sunday: null,
};

// --- HELPER COMPONENTS ---

// Updated to match the read-only style from the admin page
const InfoField = ({ label, value }) => (
    <div className="form-group flex-1 min-w-[200px]">
        <label className="form-label block font-semibold text-xs text-num-dark-text dark:text-white mb-1">{label}</label>
        <input
            type="text"
            value={value}
            readOnly
            className="form-input w-full py-2 px-3 bg-gray-100 border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 rounded-md font-medium text-xs text-gray-500 dark:text-gray-400"
        />
    </div>
);


const ScheduledInstructorCard = ({ instructor }) => (
     <div className="flex flex-col items-center space-y-1">
        <img
            src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.name.replace(' ', '+')}&background=random`} 
            alt={instructor.name}
            className="w-12 h-12 rounded-full object-cover"
        />
        <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{instructor.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{instructor.role}</p>
        </div>
    </div>
);

 const StudyModeTag = ({ mode }) => {
    const isOnline = mode === 'Online';
    const style = isOnline 
        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300" 
        : "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300";

    return (
        <div className={`rounded-md px-3 py-1 text-xs font-semibold ${style}`}>
            {mode}
        </div>
    );
};

// --- MAIN CONTENT COMPONENT ---

const InstructorClassDetailsContent = () => {
    const params = useParams();
    const [classDetails, setClassDetails] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (mockClassData) {
                    setClassDetails(mockClassData);
                    setSchedule(mockScheduleData);
                } else {
                    setError('Class not found.');
                }
            } catch (err) {
                setError("Failed to load class data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClassData();
    }, [params.classId]);

    const handleDownloadSchedule = () => {
        // Add your PDF generation logic here
        alert("Downloading schedule as PDF...");
        console.log("Downloading schedule for:", classDetails);
        console.log("Schedule data:", schedule);
    };

    if (loading) {
        return <InstructorClassDetailSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
    }
    
    if (!classDetails) {
        return <div className="p-6 text-center dark:text-white">No class data available.</div>;
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className='p-6 dark:text-white'>
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Class Details</div>
            <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
            
            {/* Class Information Section - STYLED LIKE ADMIN PAGE */}
            <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg mb-6">
                <div className="section-title font-semibold text-md text-num-dark-text dark:text-white mb-3">General Information</div>
                    <div className="space-y-2">
                        <div className="form-row flex gap-3 mb-1 flex-wrap">
                            <InfoField label="Class Name" value={classDetails.name} />
                        </div>
                        <div className="form-row flex gap-3 mb-1 flex-wrap">
                            <InfoField label="Group" value={classDetails.group} />
                            <InfoField label="Generation" value={classDetails.generation} />
                        </div>
                        <div className="form-row flex gap-3 mb-1 flex-wrap">
                            <InfoField label="Faculty" value={classDetails.faculty} />
                            <InfoField label="Degree" value={classDetails.degrees} />
                            <InfoField label="Major" value={classDetails.major} />
                        </div>
                        <div className="form-row flex gap-3 mb-1 flex-wrap">
                            <InfoField label="Semester" value={classDetails.semester} />
                            <InfoField label="Shift" value={classDetails.shift} />
                            <InfoField label="Status" value={classDetails.status} />
                        </div>
                </div>
            </div>

            {/* Schedule Class Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Schedule Class</h2>
                {/* Schedule Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {daysOfWeek.map(day => {
                        const scheduledItem = schedule[day];
                        const isNoClass = !scheduledItem;

                        let dayHeaderStyle = "bg-gray-200 dark:bg-slate-700";
                        let dayBorderStyle = "border-gray-200 dark:border-slate-700";
                        let studyModeComponent = <div className="rounded-md bg-gray-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">No Class</div>;

                        if (scheduledItem) {
                            if (scheduledItem.studyMode === 'In-Class') {
                                dayHeaderStyle = "bg-green-100 dark:bg-green-900/50";
                                dayBorderStyle = "border-green-300 dark:border-green-700";
                                studyModeComponent = <StudyModeTag mode={scheduledItem.studyMode} />;
                            } else if (scheduledItem.studyMode === 'Online') {
                                dayHeaderStyle = "bg-orange-100 dark:bg-orange-900/50";
                                dayBorderStyle = "border-orange-300 dark:border-orange-700";
                                studyModeComponent = <StudyModeTag mode={scheduledItem.studyMode} />;
                            }
                        } else {
                            dayHeaderStyle = "bg-purple-100 dark:bg-purple-900/50";
                            dayBorderStyle = "border-purple-200 dark:border-slate-700";
                        }

                        return (
                            <div key={day} className="flex flex-col gap-2">
                                <div className={`p-2 rounded-lg text-center ${dayHeaderStyle}`}>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-base">{day}</h4>
                                </div>
                                <div className={`rounded-xl p-3 min-h-[160px] w-full border ${dayBorderStyle} flex flex-col justify-center items-center`}>
                                    {isNoClass ? (
                                        studyModeComponent
                                    ) : (
                                        <div className='w-full flex flex-col items-center text-center space-y-3'>
                                            {studyModeComponent}
                                            <ScheduledInstructorCard instructor={scheduledItem.instructor} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* --- Footer for Schedule Card --- */}
                <div className="mt-8 pt-5 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-between items-end gap-4">
                    <div>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>Generation : <span className="font-semibold">{classDetails.generation}</span></li>
                            <li>Group : <span className="font-semibold">{classDetails.group}</span></li>
                            <li>Semester : <span className="font-semibold">{classDetails.semester}</span></li>
                            <li>Shift : <span className="font-semibold">{classDetails.shift}</span></li>
                        </ul>
                    </div>
                    <div className="text-right">
                        <button
                            onClick={handleDownloadSchedule}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm"
                        >
                            Download PDF file
                        </button>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Public Date : {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                    </div>
                </div>
            </div>
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
