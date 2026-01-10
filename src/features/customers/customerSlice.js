import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  "https://eb392aa9-9b22-4ac4-b3cc-7f8d369efa1e-00-3asbq4cs361u6.pike.replit.dev";

// ======================================
// ASYNC THUNKS
// ======================================

// Customer Signup
export const customerSignup = createAsyncThunk(
  "customer/signup",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/customer/signup`,
        customerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

// Customer Login
export const customerLogin = createAsyncThunk(
  "customer/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/customer/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Fetch customer's bookings
export const fetchCustomerBookings = createAsyncThunk(
  "customer/fetchBookings",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/customer/bookings/${userId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch bookings"
      );
    }
  }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "customer/cancelBooking",
  async ({ bookingId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/customer/bookings/${bookingId}/cancel`,
        { userId }
      );
      return { bookingId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to cancel booking"
      );
    }
  }
);

// ======================================
// INITIAL STATE
// ======================================
const initialState = {
  user: null, // Current logged in customer
  token: null,
  bookings: [], // Customer's bookings
  loading: false,
  error: null,
  successMessage: null,
};

// ======================================
// SLICE
// ======================================
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // Logout
    customerLogout: (state) => {
      state.user = null;
      state.token = null;
      state.bookings = [];
    },
    // Clear messages
    clearCustomerMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(customerSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(customerSignup.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Account created! Please login.";
      })
      .addCase(customerSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(customerLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = "Login successful!";
      })
      .addCase(customerLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch bookings
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

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
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

export const { customerLogout, clearCustomerMessages } = customerSlice.actions;
export default customerSlice.reducer;
