"use client";

export default function RoomGrid({ floors, allRoomsData, selectedDay, selectedTime, selectedRoom, onRoomClick }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="space-y-4">
        {floors.map(({ floor, rooms }) => (
          <div key={floor} className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Floor {floor}
              </h4>
              <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4">
              {rooms.map((roomId) => {
                const room = allRoomsData[roomId];
                if (!room) return null;

                const status = room.weeklySchedule?.[selectedDay]?.[selectedTime] || "Unavailable";
                const isAvailable = status === "Available";
                const isSelected = selectedRoom === roomId;

                return (
                  <div
                    key={roomId}
                    onClick={() => onRoomClick(roomId)}
                    className={`h-[90px] sm:h-[100px] border rounded-md flex flex-col transition-all duration-150 shadow-sm ${
                      isAvailable
                        ? "cursor-pointer hover:shadow-md bg-white dark:bg-slate-800"
                        : "cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 opacity-70"
                    } ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-500"
                        : isAvailable
                        ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div
                      className={`h-[30px] rounded-t-md flex items-center justify-center px-2 relative border-b ${
                        isSelected ? "border-b-transparent" : "border-slate-200 dark:border-slate-600"
                      } ${isAvailable ? "bg-slate-50 dark:bg-slate-700" : "bg-slate-100 dark:bg-slate-700/60"}`}
                    >
                      <div
                        className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                          isAvailable ? "bg-green-500" : "bg-red-500"
                        } ${isSelected ? "bg-blue-500" : ""}`}
                      ></div>
                      <span
                        className={`ml-3 text-xs sm:text-sm font-medium ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : isAvailable
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {room?.name || roomId}
                      </span>
                    </div>
                    <div
                      className={`flex-1 rounded-b-md p-2 flex flex-col justify-center items-center ${
                        isAvailable ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      <span
                        className={`font-semibold text-xs ${
                          isAvailable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {status}
                      </span>
                      <span
                        className={`text-xs text-slate-500 dark:text-slate-400 ${
                          isSelected ? "text-slate-600 dark:text-slate-300" : ""
                        } mt-1`}
                      >
                        Capacity: {room?.capacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}