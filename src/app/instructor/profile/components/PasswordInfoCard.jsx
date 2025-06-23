// components/PasswordInfoCard.jsx
import EyeOpenIcon from './EyeOpenIcon';
import EyeClosedIcon from './EyeClosedIcon';

const PasswordInfoCard = ({
    currentPassword,
    newPassword,
    confirmNewPassword,
    isEditingPassword,
    loading,
    emptyPasswordError,
    passwordMismatchError,
    passwordVisibility,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    togglePasswordVisibility,
    handlePasswordEditToggle,
    handleCancelClick,
    error,
    successMessage
}) => {
    return (
        <div className="info-card-password p-3 sm:p-4 bg-white border border-num-gray-light dark:bg-gray-800 dark:border-gray-700 shadow-custom-light rounded-lg">
            <div className="section-title font-semibold text-base text-num-dark-text dark:text-white mb-3">Password information</div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility.current ? "text" : "password"}
                            className={`form-input w-full py-2 px-3 bg-num-content-bg border rounded-md font-medium text-[14px] text-num-dark-text dark:text-white ${
                                emptyPasswordError.current || (error && error.includes("required") && !currentPassword)
                                    ? "border-red-500"
                                    : "border-num-gray-light dark:border-gray-600"
                            }`}
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={handleCurrentPasswordChange}
                            readOnly={!isEditingPassword}
                            disabled={loading}
                        />
                        {isEditingPassword && (
                            <span
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={() => togglePasswordVisibility('current')}
                            >
                                {passwordVisibility.current ? <EyeOpenIcon /> : <EyeClosedIcon />}
                            </span>
                        )}
                    </div>
                    {emptyPasswordError.current && (
                        <p className="text-red-500 text-xs mt-1">Current password is required.</p>
                    )}
                </div>
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility.new ? "text" : "password"}
                            className={`form-input w-full py-2 px-3 bg-num-content-bg border rounded-md font-medium text-[14px] text-num-dark-text dark:text-white ${
                                emptyPasswordError.new || (passwordMismatchError && newPassword !== confirmNewPassword)
                                    ? "border-red-500"
                                    : "border-num-gray-light dark:border-gray-600"
                            }`}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            readOnly={!isEditingPassword}
                            disabled={loading}
                        />
                        {isEditingPassword && (
                            <span
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={() => togglePasswordVisibility('new')}
                            >
                                {passwordVisibility.new ? <EyeOpenIcon /> : <EyeClosedIcon />}
                            </span>
                        )}
                    </div>
                    {emptyPasswordError.new && (
                        <p className="text-red-500 text-xs mt-1">New password is required.</p>
                    )}
                </div>
            </div>
            <div className="form-row flex gap-3 mb-2 flex-wrap">
                <div className="form-group flex-1 min-w-[200px]">
                    <label className="form-label block font-medium text-sm text-num-dark-text dark:text-white mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisibility.confirm ? "text" : "password"}
                            className={`form-input w-full py-2 px-3 bg-num-content-bg border rounded-md font-medium text-[14px] text-num-dark-text dark:text-white ${
                                emptyPasswordError.confirm || passwordMismatchError
                                    ? "border-red-500"
                                    : "border-num-gray-light dark:border-gray-600"
                            }`}
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={handleConfirmPasswordChange}
                            readOnly={!isEditingPassword}
                            disabled={loading}
                        />
                        {isEditingPassword && (
                            <span
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={() => togglePasswordVisibility('confirm')}
                            >
                                {passwordVisibility.confirm ? <EyeOpenIcon /> : <EyeClosedIcon />}
                            </span>
                        )}
                    </div>
                    {emptyPasswordError.confirm && (
                        <p className="text-red-500 text-xs mt-1">Confirm new password is required.</p>
                    )}
                    {passwordMismatchError && !emptyPasswordError.new && !emptyPasswordError.confirm && (
                        <p className="text-red-500 text-xs mt-1">New passwords do not match.</p>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm mb-2">{successMessage}</p>}
            <div className="form-actions flex justify-end mt-3">
                {isEditingPassword && (
                    <button
                        type="button"
                        onClick={() => handleCancelClick('password')}
                        className="cancel-button bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    className="save-button bg-blue-600 hover:bg-blue-700 shadow-custom-light rounded-md text-white border-none py-2 px-3 font-semibold text-sm cursor-pointer"
                    onClick={handlePasswordEditToggle}
                    disabled={loading}
                >
                    {loading && isEditingPassword ? "Saving..." : isEditingPassword ? "Save Password" : "Change Password"}
                </button>
            </div>
        </div>
    );
};

export default PasswordInfoCard;