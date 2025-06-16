"use client";

import InstructorRoomPageSkeleton from "./Skeletons";

export default function RoomDetailsPanel({ loading, roomDetails, onRequest }) {
  const textLabelRoom = "font-medium text-base leading-7 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
  const textValueRoomDisplay = "font-medium text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";
  const textLabelDefault = "font-medium text-sm leading-6 text-slate-700 dark:text-slate-300 tracking-[-0.01em]";
  const textValueDefaultDisplay = "font-medium text-sm leading-6 text-slate-900 dark:text-slate-100 tracking-[-0.01em]";

  return (
    <div className="w-full lg:w-[320px] shrink-0">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">Details</h3>
        <hr className="flex-1 border-t border-slate-300 dark:border-slate-700" />
      </div>
      <div className="flex flex-col items-start gap-6 w-full min-h-[420px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
        {loading ? (
          <InstructorRoomPageSkeleton.RoomDetailsSkeleton />
        ) : roomDetails ? (
          <>
            <div className="flex flex-col items-start self-stretch w-full flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-700 pr-1">
              <div className="w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                {/* Room Row */}
                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]">
                    <span className={textLabelRoom}>Room</span>
                  </div>
                  <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                    <span className={textValueRoomDisplay}>{roomDetails.name}</span>
                  </div>
                </div>
                {/* Building Row */}
                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]">
                    <span className={textLabelDefault}>Building</span>
                  </div>
                  <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                    <span className={textValueDefaultDisplay}>{roomDetails.building}</span>
                  </div>
                </div>
                {/* Floor Row */}
                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]">
                    <span className={textLabelDefault}>Floor</span>
                  </div>
                  <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                    <span className={textValueDefaultDisplay}>{roomDetails.floor}</span>
                  </div>
                </div>
                {/* Capacity Row */}
                <div className="flex flex-row items-center self-stretch w-full min-h-[56px] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px]">
                    <span className={textLabelDefault}>Capacity</span>
                  </div>
                  <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2">
                    <span className={textValueDefaultDisplay}>{roomDetails.capacity}</span>
                  </div>
                </div>
                {/* Equipment Row */}
                <div className="flex flex-row items-start self-stretch w-full min-h-[92px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col justify-center items-start p-3 sm:p-4 w-[100px] sm:w-[120px] pt-5">
                    <span className={textLabelDefault}>Equipment</span>
                  </div>
                  <div className="flex flex-col justify-center items-start px-2 sm:px-3 flex-1 py-2 pt-3">
                    <span className={`${textValueDefaultDisplay} pt-1`}>{roomDetails.equipment.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="flex flex-row justify-center items-center pyx-3 px-5 sm:px-6 gap-2 w-full h-[48px] sm:h-[50px] bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow-md hover:shadow-lg rounded-md text-white font-semibold text-sm sm:text-base self-stretch disabled:opacity-60 transition-all duration-150"
              onClick={onRequest}
              disabled={loading}
            >
              Request
            </button>
          </>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 w-full flex-grow flex items-center justify-center">
            Select an available room to view details.
          </div>
        )}
      </div>
    </div>
  );
}