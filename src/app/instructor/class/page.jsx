import InstructorLayout from '@/components/InstructorLayout';

const InstructorClassViewContent = () => {    
    return (
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold mb-4">Schedule</h1>
            <hr className="border-t border-gray-200 mt-4 mb-4" />
            <p>Welcome to the instructor Class Management.</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function InstructorClassPage() {
    return (
        <InstructorLayout activeItem="class" pageTitle="Class Management">
            <InstructorClassViewContent/>
        </InstructorLayout>
    );
}