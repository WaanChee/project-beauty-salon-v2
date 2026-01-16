import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./features/bookings/bookingSlice";
import customerReducer from "./features/customers/customerSlice";
import galleryReducer from "./features/gallery/gallerySlice";

// Create the Redux store
const store = configureStore({
  reducer: {
    bookings: bookingReducer,
    customer: customerReducer,
    gallery: galleryReducer,
  },
});

export default store;
