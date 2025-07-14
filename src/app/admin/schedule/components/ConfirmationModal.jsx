const ConfirmationModal = ({ isOpen, onCancel, onConfirm, swapDetails }) => {
    if (!isOpen || !swapDetails) return null;

    const { from, to } = swapDetails;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Class Swap</h2>
                <div className="space-y-4 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">Are you sure you want to swap these two classes?</p>
                    
                    <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/60">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{from.classData.className}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            From: {from.day}, {from.time} (Room {from.roomId})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            To: {to.day}, {to.time} (Room {to.roomId})
                        </p>
                    </div>
                    
                    <div className="p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/60">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{to.classData.className}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            From: {to.day}, {to.time} (Room {to.roomId})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            To: {from.day}, {from.time} (Room {from.roomId})
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Confirm Swap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;