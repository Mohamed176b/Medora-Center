import { useSelector } from "react-redux";

/**
 * Custom hook to safely access admin state from Redux
 * Prevents errors during logout when state might be null
 *
 * @returns {Object} The admin object with a fallback to an empty object
 */
const useAdminState = () => {
  const adminState = useSelector((state) => state.admin);
  // Safely access the nested admin object with fallback
  const admin = adminState?.admin?.admin || { role: [] };

  return admin;
};

export default useAdminState;
