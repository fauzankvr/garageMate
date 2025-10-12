import { useState } from "react";
import instance from "../axios/axios";
import { Eye, EyeOff, X } from "lucide-react";

interface PasswordVerificationResult {
  isValid: boolean;
  error: string | null;
}

interface PasswordVerificationHook {
  passwordModalOpen: boolean;
  password: string;
  passwordError: string | null;
  showPassword: boolean;
  openPasswordModal: (action: () => void) => void;
  closePasswordModal: () => void;
  handlePasswordSubmit: () => Promise<PasswordVerificationResult>;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  PasswordModal: React.FC;
}

export const usePasswordVerification = (): PasswordVerificationHook => {
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Verify password via API
  const verifyPassword = async (
    password: string
  ): Promise<PasswordVerificationResult> => {
    try {
      const res = await instance.post("/api/customer/verify-password", {
        password,
      });
      return { isValid: res.data.success, error: null };
    } catch (err: any) {
      console.error("Error verifying password:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to verify password";
      return { isValid: false, error: errorMessage };
    }
  };

  // Open password modal and store the action to execute
  const openPasswordModal = (action: () => void) => {
    setPendingAction(() => action);
    setPasswordModalOpen(true);
    setPassword("");
    setPasswordError(null);
  };

  // Close password modal
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPassword("");
    setPasswordError(null);
    setPendingAction(null);
  };

  // Handle password submission
  const handlePasswordSubmit =
    async (): Promise<PasswordVerificationResult> => {
      if (!password) {
        setPasswordError("Please enter a password");
        return { isValid: false, error: "Please enter a password" };
      }

      const result = await verifyPassword(password);
      if (result.isValid) {
        setPasswordError(null);
        setPasswordModalOpen(false);
        setPassword("");
        pendingAction?.();
      } else {
        setPasswordError(result.error);
      }
      return result;
    };

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Password Modal Component
  const PasswordModal: React.FC = () => (
    <>
      {passwordModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Enter Password</h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={closePasswordModal}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => await handlePasswordSubmit()} // Wrap async call in an async function
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return {
    passwordModalOpen,
    password,
    passwordError,
    showPassword,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit,
    setPassword,
    toggleShowPassword,
    PasswordModal,
  };
};
