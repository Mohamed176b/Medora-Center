import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabase/supabaseClient";

const initialState = {
  homeContent: [],
  aboutContent: [],
  servicesData: [],
  testimonialsData: [],
  doctorsData: [],
  contactData: [],
  allBlogData: [],
  blogData: [],
  categories: [],
};

const fetchHomeCntent = createAsyncThunk(
  "fetchHomeCntent",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("pages_content")
        .select("*")
        .eq("page_key", "home")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAboutContent = createAsyncThunk(
  "fetchAboutContent",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("pages_content")
        .select("*")
        .eq("page_key", "about_us")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchServicesData = createAsyncThunk(
  "fetchServicesData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
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

// Move fetchDoctorsData before fetchTestimonialsData to ensure it's defined before being used
const fetchDoctorsData = createAsyncThunk(
  "fetchDoctorsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchTestimonialsData = createAsyncThunk(
  "fetchTestimonialsData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*, patients(full_name)")
        .eq("is_reviewed", true)
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

const fetchContactData = createAsyncThunk(
  "fetchContactData",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("site_contact")
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchAllBlogData = createAsyncThunk(
  "fetchAllBlogData",
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
        )
      `
        )
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchBlogData = createAsyncThunk(
  "fetchBlogData",
  async (slug, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
        *,
        author:author_id(full_name, email),
        categories:blog_posts_categories(
          category:category_id(id, name, slug)
        )
      `
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchCategories = createAsyncThunk(
  "fetchCategories",
  async (slug, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const siteDataSlice = createSlice({
  name: "siteData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Home Content
      .addCase(fetchHomeCntent.pending, (state) => {
        state.homeContent = [];
      })
      .addCase(fetchHomeCntent.fulfilled, (state, action) => {
        state.homeContent = action.payload;
      })
      .addCase(fetchHomeCntent.rejected, (state) => {
        state.homeContent = [];
      })
      // About Content
      .addCase(fetchAboutContent.pending, (state) => {
        state.aboutContent = [];
      })
      .addCase(fetchAboutContent.fulfilled, (state, action) => {
        state.aboutContent = action.payload;
      })
      .addCase(fetchAboutContent.rejected, (state) => {
        state.aboutContent = [];
      })
      // Services Data
      .addCase(fetchServicesData.pending, (state) => {
        state.servicesData = [];
      })
      .addCase(fetchServicesData.fulfilled, (state, action) => {
        state.servicesData = action.payload || [];
      })
      .addCase(fetchServicesData.rejected, (state) => {
        state.servicesData = [];
      })
      // Testimonials Data
      .addCase(fetchTestimonialsData.pending, (state) => {
        state.testimonialsData = [];
      })
      .addCase(fetchTestimonialsData.fulfilled, (state, action) => {
        state.testimonialsData = action.payload;
      })
      .addCase(fetchTestimonialsData.rejected, (state) => {
        state.testimonialsData = [];
      })
      // Doctors Data
      .addCase(fetchDoctorsData.pending, (state) => {
        state.doctorsData = [];
      })
      .addCase(fetchDoctorsData.fulfilled, (state, action) => {
        state.doctorsData = action.payload;
      })
      .addCase(fetchDoctorsData.rejected, (state) => {
        state.doctorsData = [];
      })
      // Contact Data
      .addCase(fetchContactData.pending, (state) => {
        state.contactData = [];
      })
      .addCase(fetchContactData.fulfilled, (state, action) => {
        state.contactData = action.payload;
      })
      .addCase(fetchContactData.rejected, (state) => {
        state.contactData = [];
      })
      // All Blog Data
      .addCase(fetchAllBlogData.pending, (state) => {
        state.allBlogData = [];
      })
      .addCase(fetchAllBlogData.fulfilled, (state, action) => {
        state.allBlogData = action.payload;
      })
      .addCase(fetchAllBlogData.rejected, (state) => {
        state.allBlogData = [];
      })
      // Blog Data
      .addCase(fetchBlogData.pending, (state) => {
        state.blogData = [];
      })
      .addCase(fetchBlogData.fulfilled, (state, action) => {
        state.blogData = action.payload;
      })
      .addCase(fetchBlogData.rejected, (state) => {
        state.blogData = [];
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categories = [];
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categories = [];
      });
  },
});

export {
  fetchHomeCntent,
  fetchAboutContent,
  fetchServicesData,
  fetchTestimonialsData,
  fetchDoctorsData,
  fetchContactData,
  fetchAllBlogData,
  fetchBlogData,
  fetchCategories,
};

export default siteDataSlice.reducer;
