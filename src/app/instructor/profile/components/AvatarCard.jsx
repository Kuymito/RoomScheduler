// components/AvatarCard.jsx
import Image from 'next/image';

const AvatarCard = ({ profileData, imagePreviewUrl, isEditingGeneral, editableProfileData, handleUploadButtonClick, isUploading, fileInputRef, handleFileChange, loading }) => {
    return (
        <div className="avatar-card w-[220px] h-[110px] p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 shadow-sm rounded-lg flex-shrink-0">
            <div className="avatar-content flex items-center">
                <Image
                    src={imagePreviewUrl || profileData.avatarUrl}
                    alt="Profile Avatar"
                    width={56}
                    height={56}
                    className="avatar-img w-12 h-12 rounded-full mr-3 object-cover mb-6"
                />
                <div className="avatar-info flex flex-col">
                    <div className="avatar-name font-semibold text-sm text-gray-800 dark:text-gray-200 mb-0.5">
                        Dr.{" "}
                        {isEditingGeneral
                            ? `${editableProfileData?.firstName ?? ""} ${
                                  editableProfileData?.lastName ?? ""
                              }`.trim()
                            : `${profileData.firstName} ${profileData.lastName}`.trim()}
                    </div>
                    <div className="avatar-role font-semibold text-xs text-gray-500 dark:text-gray-400">
                        Instructor
                    </div>
                    <button
                        type="button"
                        onClick={handleUploadButtonClick}
                        disabled={isUploading || loading}
                        className="w-full rounded-md mt-2 px-3 py-2 text-xs font-semibold
                                    text-white bg-blue-600 hover:bg-blue-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        {isUploading ? "Uploading..." : "Upload Picture"}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="sr-only"
                    />
                </div>
            </div>
        </div>
    );
};

export default AvatarCard;