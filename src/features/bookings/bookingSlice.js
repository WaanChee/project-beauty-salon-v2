import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";

// Async action to fetch all bookings (for admin view later)
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/bookings`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

// Async action to create a new booking (with customer info)
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      // bookingData now includes: title, description, date, time, customer_name, customer_email, customer_phone
      const response = await axios.post(`${API_URL}/bookings`, bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create booking"
      );
    }
  }
);

// Async action to update a booking
export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async ({ id, bookingData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${id}`,
        bookingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update booking"
      );
    }
  }
);

// Async action to delete a booking
export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/bookings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete booking"
      );
    }
  }
);

// Initial state
const initialState = {
  bookings: [], // Array of all bookings
  loading: false, // Loading status
  error: null, // Error message
  successMessage: null, // Success message
  formResetTrigger: 0, // Trigger to signal form reset to components
};

// Create the slice
const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    // Clear error and success messages
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Trigger form reset by incrementing counter
    triggerFormReset: (state) => {
      state.formResetTrigger += 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.successMessage = "Booking created successfully!";
        // Trigger form reset immediately after successful booking
        state.formResetTrigger += 1;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update booking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.successMessage = "Booking updated successfully!";
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete booking
    builder
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
        state.successMessage = "Booking deleted successfully!";
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, triggerFormReset } = bookingSlice.actions;
export default bookingSlice.reducer;
