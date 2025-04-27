import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./slices/toastSlice";
import userReducer from "./slices/userSlice";
import adminReducer from "./slices/adminSlice";
import siteDataReducer from "./slices/siteDataSlice";

export const store = configureStore({
  reducer: {
    toast: toastReducer,
    user: userReducer,
    admin: adminReducer,
    siteData: siteDataReducer,
  },
});

export default store;
