import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabase/supabaseClient";

const initialState = {
  admin: null,
  isAdminAuthenticated: false,
  loading: false,
  allAdminsData: [],
  allAppointmentsData: [],
  allUsersData: [],
  allDoctorsData: [],
  allServicesData: [],
  allMessagesData: [],
  allTestimonialsData: [],
  siteSettings: {
    home: null,
    about: null,
    contact: null,
    loading: false,
    error: null,
  },
  allBlogPosts: [],
  blogCategories: [],
  blogLoading: false,
  blogError: null,
};

const fetchAllAdminsData = createAsyncThunk(
  "admin/fetchAllAdminsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.rpc("get_all_admins");
      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAllAppointmentsData = createAsyncThunk(
  "admin/fetchAllAppointmentsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await await supabase
        .from("appointments")
        .select(`*, patients (*), doctors (*), services (*)`)
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAllUsersData = createAsyncThunk(
  "admin/fetchAllUsersData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("patients").select(`
                *,
                messages: messages(count),
                testimonials: testimonials(count),
                appointments: appointments(count)
              `);
      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const fetchAllDoctorsData = createAsyncThunk(
  "admin/fetchDoctorsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select(
          `
          *,
          doctor_services(
            service_id,
            services(*)
          )
        `
        )
        .order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the services from the nested structure
      const transformedDoctors = data.map((doctor) => ({
        ...doctor,
        services: doctor.doctor_services?.[0]?.services || null,
      }));

      return transformedDoctors;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const fetchAllServicesData = createAsyncThunk(
  "admin/fetchAllServicesData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const fetchAllMessagesData = createAsyncThunk(
  "admin/fetchAllMessagesData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
        *,
        patients (
          full_name,
          email
        )
      `
        )
        .order("sent_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const fetchAllTestimonialsData = createAsyncThunk(
  "admin/fetchAllTestimonialsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select(
          `
        *,
        patients (
          full_name,
          email
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const fetchSiteSettings = createAsyncThunk(
  "admin/fetchSiteSettings",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch home and about settings
      const { data: pagesData, error: pagesError } = await supabase
        .from("pages_content")
        .select("*");

      if (pagesError) throw pagesError;

      // Fetch contact settings
      const { data: contactData, error: contactError } = await supabase
        .from("site_contact")
        .select("*")
        .single();

      if (contactError && contactError.code !== "PGRST116") throw contactError;

      const home = pagesData?.find((page) => page.page_key === "home") || null;
      const about =
        pagesData?.find((page) => page.page_key === "about_us") || null;

      return {
        home,
        about,
        contact: contactData || null,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAllBlogPosts = createAsyncThunk(
  "admin/fetchAllBlogPosts",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:author_id(full_name, email),
          categories:blog_posts_categories(
            category:category_id(id, name, slug)
          ),
          attachments
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the categories from the nested structure
      const transformedPosts = data.map((post) => ({
        ...post,
        categories: post.categories.map((category) => category.category),
      }));

      return transformedPosts || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAllBlogCategories = createAsyncThunk(
  "admin/fetchAllBlogCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAdminAuthenticated = true;
    },
    clearAdmin: (state) => {
      state.admin = null;
      state.isAdminAuthenticated = false;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAllUsersData: (state, action) => {
      state.allUsersData = action.payload;
    },
    setAllMessagesData: (state, action) => {
      state.allMessagesData = action.payload;
    },
    updateTestimonials: (state, action) => {
      state.allTestimonialsData = action.payload;
    },
    updateSiteSettings: (state, action) => {
      const { page, data } = action.payload;
      state.siteSettings[page] = data;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdminsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAdminsData.fulfilled, (state, action) => {
        state.loading = false;
        state.allAdminsData = action.payload;
      })
      .addCase(fetchAllAdminsData.rejected, (state, action) => {
        state.loading = false;
        console.error("Error fetching all admins data:", action.payload);
      })
      .addCase(fetchAllAppointmentsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAppointmentsData.fulfilled, (state, action) => {
        state.loading = false;
        state.allAppointmentsData = action.payload;
      })
      .addCase(fetchAllAppointmentsData.rejected, (state, action) => {
        state.loading = false;
        console.error("Error fetching all Appointments data:", action.payload);
      })
      .addCase(fetchAllUsersData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsersData.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsersData = action.payload;
      })
      .addCase(fetchAllUsersData.rejected, (state, action) => {
        state.loading = false;
        console.error("Error fetching all users data:", action.payload);
      })
      .addCase(fetchAllDoctorsData.pending, (state) => {
        state.allDoctorsData = [];
      })
      .addCase(fetchAllDoctorsData.fulfilled, (state, action) => {
        state.allDoctorsData = action.payload;
      })
      .addCase(fetchAllDoctorsData.rejected, (state) => {
        state.allDoctorsData = [];
      })
      .addCase(fetchAllServicesData.pending, (state) => {
        state.allServicesData = [];
      })
      .addCase(fetchAllServicesData.fulfilled, (state, action) => {
        state.allServicesData = action.payload || [];
      })
      .addCase(fetchAllServicesData.rejected, (state) => {
        state.allServicesData = [];
      })
      .addCase(fetchAllMessagesData.pending, (state) => {
        state.allMessagesData = [];
      })
      .addCase(fetchAllMessagesData.fulfilled, (state, action) => {
        state.allMessagesData = action.payload || [];
      })
      .addCase(fetchAllMessagesData.rejected, (state) => {
        state.allMessagesData = [];
      })
      .addCase(fetchAllTestimonialsData.pending, (state) => {
        state.allTestimonialsData = [];
      })
      .addCase(fetchAllTestimonialsData.fulfilled, (state, action) => {
        state.allTestimonialsData = action.payload || [];
      })
      .addCase(fetchAllTestimonialsData.rejected, (state) => {
        state.allTestimonialsData = [];
      })
      .addCase(fetchSiteSettings.pending, (state) => {
        state.siteSettings.loading = true;
        state.siteSettings.error = null;
      })
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        state.siteSettings.loading = false;
        state.siteSettings.home = action.payload.home;
        state.siteSettings.about = action.payload.about;
        state.siteSettings.contact = action.payload.contact;
        state.siteSettings.error = null;
      })
      .addCase(fetchSiteSettings.rejected, (state, action) => {
        state.siteSettings.loading = false;
        state.siteSettings.error = action.payload;
      })
      .addCase(fetchAllBlogPosts.pending, (state) => {
        state.blogLoading = true;
        state.blogError = null;
      })
      .addCase(fetchAllBlogPosts.fulfilled, (state, action) => {
        state.blogLoading = false;
        state.allBlogPosts = action.payload;
        state.blogError = null;
      })
      .addCase(fetchAllBlogPosts.rejected, (state, action) => {
        state.blogLoading = false;
        state.blogError = action.payload;
      })
      .addCase(fetchAllBlogCategories.pending, (state) => {
        state.blogLoading = true;
        state.blogError = null;
      })
      .addCase(fetchAllBlogCategories.fulfilled, (state, action) => {
        state.blogLoading = false;
        state.blogCategories = action.payload;
        state.blogError = null;
      })
      .addCase(fetchAllBlogCategories.rejected, (state, action) => {
        state.blogLoading = false;
        state.blogError = action.payload;
      });
  },
});

export const {
  setAdmin,
  clearAdmin,
  setAdminLoading,
  setAllUsersData,
  setAllMessagesData,
  updateTestimonials,
  updateSiteSettings,
} = adminSlice.actions;

export {
  fetchAllAdminsData,
  fetchAllAppointmentsData,
  fetchAllUsersData,
  fetchAllDoctorsData,
  fetchAllServicesData,
  fetchAllMessagesData,
  fetchAllTestimonialsData,
  fetchSiteSettings,
  fetchAllBlogPosts,
  fetchAllBlogCategories,
};

export default adminSlice.reducer;
