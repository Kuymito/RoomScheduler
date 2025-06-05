import InstructorLayout from '@/components/InstructorLayout';

const RoomViewContent = () => {    
    return (
        <div className="p-6 dark:text-white">
            <h1 className="text-lg font-bold mb-4">Schedule</h1>
            <hr className="border-t border-gray-200 mt-4 mb-4" />
            <p className='bg-red-500'>Room</p>
        {/* Add more dashboard content here */}
        </div>
    );
};

export default function InstructorRoomPage() {
    return (
        <InstructorLayout activeItem="schedule" pageTitle="Schedule Management">
            <RoomViewContent/>
        </InstructorLayout>
    );
}