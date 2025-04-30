import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
  message: '',
  type: 'success', 
  duration: 3000,
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      const { message, type = 'success', duration = 3000 } = action.payload;
      state.show = true;
      state.message = message;
      state.type = type;
      state.duration = duration;
    },
    hideToast: (state) => {
      state.show = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;

export default toastSlice.reducer; 