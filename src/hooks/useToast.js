import { useDispatch } from 'react-redux';
import { showToast, hideToast } from '../redux/slices/toastSlice';

const useToast = () => {
  const dispatch = useDispatch();
  const toast = (message, type = 'success', duration = 3000) => {
    dispatch(showToast({ message, type, duration }));
  };

  const hideToastManually = () => {
    dispatch(hideToast());
  };

  return { toast, hideToastManually };
};

export default useToast; 