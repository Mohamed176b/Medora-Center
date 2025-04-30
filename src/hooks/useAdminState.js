import { useSelector } from "react-redux";

const useAdminState = () => {
  const adminState = useSelector((state) => state.admin);
  const admin = adminState?.admin?.admin || { role: [] };
  return admin;
};

export default useAdminState;
