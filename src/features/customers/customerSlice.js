// ============================================================================
// CUSTOMER SLICE - Booking Management Only
// ============================================================================
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ============================================================================
// API URL - Update this to match your backend
// ============================================================================
const API_URL =
  "https://86605879-7581-472d-a2f1-a4d71a358503-00-1nvtq3qgvln7.pike.replit.dev";

// ============================================================================
// ASYNC THUNKS - Booking Operations Only
// ============================================================================

// Fetch customer's bookings
export const fetchCustomerBookings = createAsyncThunk(
  "customer/fetchBookings",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("🔵 Fetching bookings for user:", userId);

      const response = await axios.get(
        `${API_URL}/customer/bookings/${userId}`,
        {
          // Cache-busting + explicit no-cache headers to force fresh data
          params: { _: Date.now() },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      console.log("✅ Bookings fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Fetch bookings error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bookings"
      );
    }
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "customer/cancelBooking",
  async ({ bookingId, userId }, { rejectWithValue }) => {
    try {
      console.log("🔵 Cancelling booking:", bookingId);

      const response = await axios.patch(
        `${API_URL}/customer/bookings/${bookingId}/cancel`,
        { userId }
      );

      console.log("✅ Booking cancelled:", response.data);
      return { bookingId, ...response.data };
    } catch (error) {
      console.error(
        "❌ Cancel booking error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || "Failed to cancel booking"
      );
    }
  }
);

// ============================================================================
// INITIAL STATE
// ============================================================================
const initialState = {
  bookings: [], // Customer's bookings
  loading: false,
  error: null,
  successMessage: null,
};

// ============================================================================
// SLICE
// ============================================================================
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // Clear messages
    clearCustomerMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Reset entire customer state on logout
    resetCustomerState: (state) => {
      state.bookings = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ========================================================================
    // FETCH BOOKINGS
    // ========================================================================
    builder
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ========================================================================
    // CANCEL BOOKING
    // ========================================================================
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Update the booking status in the array
        const index = state.bookings.findIndex(
          (b) => b.id === action.payload.bookingId
        );
        if (index !== -1) {
          state.bookings[index].status = "Cancelled";
        }
        state.successMessage = "Booking cancelled successfully!";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomerMessages, resetCustomerState } =
  customerSlice.actions;
export default customerSlice.reducer;
