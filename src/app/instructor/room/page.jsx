import { Suspense } from 'react';
import InstructorLayout from "@/components/InstructorLayout";
import InstructorRoomPageSkeleton from "./components/InstructorRoomPageSkeleton";
import InstructorRoomClientView from './components/InstructorRoomClientView';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { roomService } from '@/services/room.service';
import { scheduleService } from '@/services/schedule.service';
import { classService } from '@/services/class.service';
import { shiftService } from '@/services/shift.service';

const baseBuildingLayout = {
    "Building A": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building B": [ { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building C": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building D": [ { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building E": [ { floor: 5, rooms: [] }, { floor: 4, rooms: [] }, { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
    "Building F": [ { floor: 5, rooms: [] }, { floor: 4, rooms: [] }, { floor: 3, rooms: [] }, { floor: 2, rooms: [] }, { floor: 1, rooms: [] } ],
};

async function fetchAllRoomsAndSchedules() {
    const session = await getServerSession(authOptions);
    const token = session?.accessToken;

    if (!token) {
        console.error("Instructor Room Page: Not authenticated.");
        return { initialAllRoomsData: {}, buildingLayout: baseBuildingLayout, initialScheduleMap: {}, initialInstructorClasses: [], allShifts: [] };
    }

    try {
        const [apiRooms, apiSchedulesResponse, apiInstructorClasses, apiShifts] = await Promise.all([
            roomService.getAllRooms(token),
            scheduleService.getAllSchedules(token),
            classService.getMyClasses(token),
            shiftService.getAllShifts(token)
        ]);
        
        const apiSchedules = Array.isArray(apiSchedulesResponse) ? apiSchedulesResponse : (apiSchedulesResponse.payload || []);

        const roomsDataMap = {};
        const populatedLayout = JSON.parse(JSON.stringify(baseBuildingLayout));

        apiRooms.forEach(room => {
            const { roomId, roomName, buildingName, floor, capacity, type, equipment } = room;
            if (populatedLayout[buildingName]) {
                let floorObject = populatedLayout[buildingName].find(layoutFloor => layoutFloor.floor === floor);
                if (!floorObject) {
                    floorObject = { floor: floor, rooms: [] };
                    populatedLayout[buildingName].push(floorObject);
                }
                if (!floorObject.rooms.includes(roomName)) {
                     floorObject.rooms.push(roomName);
                }
            }
            roomsDataMap[roomId] = {
                id: roomId, name: roomName, building: buildingName, floor: floor,
                capacity: capacity, type: type,
                equipment: typeof equipment === 'string' ? equipment.split(',').map(item => item.trim()).filter(Boolean) : (Array.isArray(equipment) ? equipment : []),
            };
        });
        
        // --- THIS IS THE FIX ---
        // The logic is updated to process the 'dayDetails' array.
        const scheduleMap = {};
        apiSchedules.forEach(schedule => {
            if (schedule && schedule.shift && schedule.dayDetails) {
                const timeSlot = `${schedule.shift.startTime}-${schedule.shift.endTime}`;
                
                schedule.dayDetails.forEach(dayDetail => {
                    // Only map physical classes to the room availability grid
                    if (!dayDetail.online && schedule.roomId) {
                        const dayKey = dayDetail.dayOfWeek.toUpperCase();
                        if (!scheduleMap[dayKey]) scheduleMap[dayKey] = {};
                        if (!scheduleMap[dayKey][timeSlot]) scheduleMap[dayKey][timeSlot] = {};
                        scheduleMap[dayKey][timeSlot][schedule.roomId] = schedule.className;
                    }
                });
            }
        });
        
        const formattedClasses = apiInstructorClasses.map(classObject => ({
            id: classObject.classId,
            name: classObject.className,
            shift: `${classObject.shift.startTime}-${classObject.shift.endTime}`,
        }));

        for (const building in populatedLayout) {
            populatedLayout[building].sort((a, b) => b.floor - a.floor);
        }

        return { 
            initialAllRoomsData: roomsDataMap, 
            buildingLayout: populatedLayout,
            initialScheduleMap: scheduleMap,
            initialInstructorClasses: formattedClasses,
            allShifts: apiShifts || []
        };

    } catch (error) {
        console.error("Failed to fetch data for instructor room page:", error.message);
        return { initialAllRoomsData: {}, buildingLayout: {}, initialScheduleMap: {}, initialInstructorClasses: [], allShifts: [] };
    }
}

export default async function InstructorRoomPage() {
    const { initialAllRoomsData, buildingLayout, initialScheduleMap, initialInstructorClasses, allShifts } = await fetchAllRoomsAndSchedules();

    return (
        <InstructorLayout activeItem="room" pageTitle="Room Availability">
            <Suspense fallback={<InstructorRoomPageSkeleton />}>
                <InstructorRoomClientView
                    initialAllRoomsData={initialAllRoomsData}
                    buildingLayout={buildingLayout}
                    initialScheduleMap={initialScheduleMap}
                    initialInstructorClasses={initialInstructorClasses}
                    allShifts={allShifts}
                />
            </Suspense>
        </InstructorLayout>
    );
}