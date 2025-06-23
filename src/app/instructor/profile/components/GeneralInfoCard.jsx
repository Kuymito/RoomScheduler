// components/GeneralInfoCard.jsx
const GeneralInfoCard = ({ profileData, editableProfileData, isEditingGeneral, handleGeneralInputChange, loading }) => {
    return (
        <div className="info-card p-3 sm:p-4 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg">
            <div className="section-title font-semibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                General Information
            </div>

            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.firstName || ""
                                : profileData.firstName
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.lastName || ""
                                : profileData.lastName
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.email || ""
                                : profileData.email
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.phoneNumber || ""
                                : profileData.phoneNumber
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Degree
                    </label>
                    <input
                        type="text"
                        name="degree"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.degree || ""
                                : profileData.degree
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
                {/* major */}
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Major
                    </label>
                    <input
                        type="text"
                        name="major"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.major || ""
                                : profileData.major
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* department */}
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Department
                    </label>
                    <input
                        type="text"
                        name="department"
                        className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                            !isEditingGeneral
                                ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                        value={
                            isEditingGeneral
                                ? editableProfileData?.department || ""
                                : profileData.department
                        }
                        onChange={handleGeneralInputChange}
                        readOnly={!isEditingGeneral}
                        disabled={loading}
                    />
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">
                        Address
                    </label>
                    <div className="form-group flex-1 min-w-[200px]">
                        <input
                            type="text"
                            name="address"
                            className={`form-input w-full py-2 px-3 border rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 ${
                                !isEditingGeneral
                                    ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            }`}
                            value={
                                isEditingGeneral
                                    ? editableProfileData?.address || ""
                                    : profileData.address
                            }
                            onChange={handleGeneralInputChange}
                            readOnly={!isEditingGeneral}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
            <div className="form-actions flex justify-end mt-3">
                {isEditingGeneral ? (
                    <>
                        <button
                            type="button"
                            onClick={() => handleCancelClick('general')}
                            className="cancel-button bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSaveClick('general')}
                            className="save-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleEditClick('general')}
                        className="edit-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                        disabled={loading}
                    >
                        Edit General Information
                    </button>
                )}
            </div>
        </div>
    );
};

export default GeneralInfoCard;