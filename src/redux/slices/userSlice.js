import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabase/supabaseClient";

export const fetchUserAppointments = createAsyncThunk(
  "user/fetchAppointments",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          patient_id,
          doctor_id,
          appointment_day,
          appointment_time,
          status,
          notes,
          created_at,
          service_id,
          services:service_id (title)
        `
        )
        .eq("patient_id", userId)
        .order("appointment_day", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserAppointment = createAsyncThunk(
  "user/deleteAppointment",
  async ({ appointmentId, userId }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId)
        .eq("patient_id", userId)
        .eq("status", "pending");

      if (error) throw error;
      return appointmentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserAppointment = createAsyncThunk(
  "user/updateAppointment",
  async ({ appointmentId, userId, updateData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", appointmentId)
        .eq("patient_id", userId)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUserAppointment = createAsyncThunk(
  "user/createAppointment",
  async ({ userId, appointmentData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([{ ...appointmentData, patient_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserMessages = createAsyncThunk(
  "user/fetchMessages",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", userId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUserMessage = createAsyncThunk(
  "user/createMessage",
  async ({ userId, messageData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ ...messageData, patient_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserMessage = createAsyncThunk(
  "user/deleteMessage",
  async ({ messageId, userId }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("patient_id", userId);

      if (error) throw error;
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserTestimonials = createAsyncThunk(
  "user/fetchTestimonials",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUserTestimonial = createAsyncThunk(
  "user/createTestimonial",
  async ({ userId, testimonialData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .insert([{ ...testimonialData, patient_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserTestimonial = createAsyncThunk(
  "user/deleteTestimonial",
  async ({ testimonialId, userId }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialId)
        .eq("patient_id", userId);

      if (error) throw error;
      return testimonialId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  appointments: [],
  messages: [],
  testimonials: [],
  appointmentsLoading: false,
  messagesLoading: false,
  testimonialsLoading: false,
  appointmentsError: null,
  messagesError: null,
  testimonialsError: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (!action.payload || action.payload.is_active !== true) {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        return;
      }
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Appointments
    builder
      .addCase(fetchUserAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchUserAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchUserAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })

      // Delete Appointment
      .addCase(deleteUserAppointment.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(deleteUserAppointment.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = state.appointments.filter(
          (apt) => apt.id !== action.payload
        );
      })
      .addCase(deleteUserAppointment.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })

      // Update Appointment
      .addCase(updateUserAppointment.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(updateUserAppointment.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt.id === action.payload.id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateUserAppointment.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })

      // Create Appointment
      .addCase(createUserAppointment.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(createUserAppointment.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments.unshift(action.payload);
      })
      .addCase(createUserAppointment.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })

      // Messages reducers
      .addCase(fetchUserMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchUserMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload;
      })
      .addCase(createUserMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      })
      .addCase(deleteUserMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(
          (msg) => msg.id !== action.payload
        );
      })

      // Testimonials reducers
      .addCase(fetchUserTestimonials.pending, (state) => {
        state.testimonialsLoading = true;
        state.testimonialsError = null;
      })
      .addCase(fetchUserTestimonials.fulfilled, (state, action) => {
        state.testimonialsLoading = false;
        state.testimonials = action.payload;
      })
      .addCase(fetchUserTestimonials.rejected, (state, action) => {
        state.testimonialsLoading = false;
        state.testimonialsError = action.payload;
      })
      .addCase(createUserTestimonial.fulfilled, (state, action) => {
        state.testimonials.unshift(action.payload);
      })
      .addCase(deleteUserTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter(
          (t) => t.id !== action.payload
        );
      });
  },
});

export const { setUser, clearUser, setLoading, updateUser } = userSlice.actions;

export default userSlice.reducer;
