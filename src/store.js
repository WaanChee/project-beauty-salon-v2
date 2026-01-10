import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./features/bookings/bookingSlice";
import customerReducer from "./features/customers/customerSlice";

// Create the Redux store
const store = configureStore({
  reducer: {
    bookings: bookingReducer,
    customers: customerReducer,
  },
});

export default store;
