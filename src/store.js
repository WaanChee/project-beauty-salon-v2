import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./features/bookings/bookingSlice";

// Create the Redux store
const store = configureStore({
  reducer: {
    bookings: bookingReducer,
  },
});

export default store;
