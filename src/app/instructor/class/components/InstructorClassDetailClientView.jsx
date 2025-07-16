'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- HELPER COMPONENTS (from your original file) ---

const DefaultAvatarIcon = ({ className = "w-12 h-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={className}>
<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
);

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

const ScheduledInstructorCard = ({ instructor }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
         <div className="flex flex-col items-center space-y-1">
            {instructor.avatar && !imageError ? (
                <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={handleImageError}
                />
            ) : (
                <DefaultAvatarIcon className="w-12 h-12" />
            )}
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{instructor.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{instructor.role}</p>
            </div>
        </div>
    );
};


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

// --- CONSTANTS ---
const DAY_HEADER_COLORS = {
    Monday: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    Tuesday: 'bg-purple-50 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Wednesday: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    Thursday: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Friday: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Saturday: 'bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    Sunday: 'bg-pink-50 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};


/**
 * This is the Client Component for the Instructor Class Detail page.
 * It receives its data via props and is only responsible for rendering the UI.
 */
export default function InstructorClassDetailClientView({ initialClassDetails, initialSchedule }) {
    const [classDetails] = useState(initialClassDetails);
    const [schedule] = useState(initialSchedule);
    const [isPreparingPdf, setIsPreparingPdf] = useState(false);

    const handleDownloadSchedule = async () => {
        const schedulePanelElement = document.getElementById('weeklySchedulePanel');
        if (!schedulePanelElement) return;

        setIsPreparingPdf(true);
        
        // Brief delay to allow the UI to update with the loading state
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const canvas = await html2canvas(schedulePanelElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;

            let newImgWidth = pdfWidth - 40;
            let newImgHeight = newImgWidth / ratio;

            if (newImgHeight > pdfHeight - 40) {
                newImgHeight = pdfHeight - 40;
                newImgWidth = newImgHeight * ratio;
            }

            const xOffset = (pdfWidth - newImgWidth) / 2;
            const yOffset = (pdfHeight - newImgHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, newImgWidth, newImgHeight);
            
            const copyrightText = `© Copyright ${new Date().getFullYear()} NUM-FIT Digital Center. All rights reserved.`;
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            pdf.text(copyrightText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

            pdf.save(`schedule_${classDetails.name.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsPreparingPdf(false);
        }
    };

    if (!classDetails) {
        return <div className="p-6 text-center dark:text-white">No class data available.</div>;
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className='p-6 dark:text-white relative'>
             {isPreparingPdf && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center gap-4">
                        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Preparing Download...</span>
                    </div>
                </div>
            )}
            <div className="section-title font-semibold text-lg text-num-dark-text dark:text-white mb-4">Class Details</div>
             <hr className="border-t border-slate-300 dark:border-slate-700 mt-4 mb-8" />
            
            <div className="info-card p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg mb-6">
                <div className="section-title font-semibold text-sm text-num-dark-text dark:text-white mb-3">General Information</div>
                 <div className="space-y-4">
                    <div className="form-row flex gap-3 mb-2 flex-wrap">
                        <InfoField label="Name" value={classDetails.name} />
                    </div>
                    <div className="form-row flex gap-3 mb-2 flex-wrap">
                        <InfoField label="Generation" value={classDetails.generation} />
                        <InfoField label="Group" value={classDetails.group} />
                    </div>
                    <div className="form-row flex gap-3 mb-2 flex-wrap">
                        <InfoField label="Faculty" value={classDetails.faculty} />
                        <InfoField label="Degree" value={classDetails.degrees} />
                        <InfoField label="Major" value={classDetails.major} />
                    </div>
                    <div className="form-row flex gap-3 mb-2 flex-wrap">
                        <InfoField label="Semester" value={classDetails.semester} />
                        <InfoField label="Shift" value={classDetails.shift} />
                        <InfoField label="Status" value={classDetails.status} />
                    </div>
                </div>
            </div>

            <div id="weeklySchedulePanel" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                    Schedule Class - {classDetails.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {daysOfWeek.map(day => {
                        const scheduledItem = schedule[day];
                        const isNoClass = !scheduledItem;

                        const dayHeaderStyle = DAY_HEADER_COLORS[day] || "bg-gray-200 dark:bg-slate-700";
                        
                        let dayBorderStyle = "border-gray-200 dark:border-slate-700";
                        let studyModeComponent = <div className="rounded-md bg-gray-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">No Class</div>;

                        if (scheduledItem) {
                            if (scheduledItem.studyMode === 'In-Class') {
                                dayBorderStyle = "border-green-300 dark:border-green-700";
                                studyModeComponent = <StudyModeTag mode={scheduledItem.studyMode} />;
                            } else if (scheduledItem.studyMode === 'Online') {
                                dayBorderStyle = "border-orange-300 dark:border-orange-700";
                                studyModeComponent = <StudyModeTag mode={scheduledItem.studyMode} />;
                            }
                        } else {
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
                            disabled={isPreparingPdf}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isPreparingPdf ? 'Generating...' : 'Download PDF file'}
                        </button>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Public Date : {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}