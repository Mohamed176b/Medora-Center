import { supabase } from "./supabaseClient";

export const getUserProviderByEmail = async (email) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password: 'invalid-password-for-check' });
    if (!error) {
      return 'email';
    }
    if (error.message && error.message.includes('Invalid login credentials')) {
      return 'email';
    }
    if (error.message && error.message.includes('Signups not allowed for this instance')) {
      return null;
    }
    if (error.message && error.message.includes('User has not signed up')) {
      return null;
    }
    if (error.message && error.message.includes('identity provider')) {
      return 'google';
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const registerUser = async (email, password, name) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/login",
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      if (
        authError.message &&
        (authError.message.includes("already registered") ||
          authError.message.includes("User already exists") ||
          authError.message.includes("User already registered") ||
          authError.message.includes("Email rate limit exceeded") ||
          authError.message.includes("duplicate key value violates unique constraint"))
      ) {
        return { success: false, error: "البريد الإلكتروني مستخدم بالفعل. إذا لم تصلك رسالة التحقق سابقًا يمكنك طلب إعادة إرسالها من صفحة تسجيل الدخول." };
      }
      throw authError;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: authData.user.id,
        email,
        name,
      })
    );

    return {
      success: true,
      user: authData.user,
      emailConfirmationSent: true,
    };

  } catch (error) {
    // console.error("Registration error:", error.message);
    return { success: false, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    if (localStorage.getItem("admin")) {
      await supabase.auth.signOut();
      localStorage.removeItem("admin");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let { data: profileData, error: profileError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileData && profileData.is_active === false) {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      return { success: false, error: 'حسابك غير نشط. يرجى التواصل مع الدعم.' };
    }

    if (profileError && profileError.code === "PGRST116") {
      const userData = await supabase.auth.getUser();
      const userMetadata = userData.data.user.user_metadata;

      const { data: newProfile, error: insertError } = await supabase
        .from("patients")
        .insert([
          {
            id: data.user.id,
            email: email,
            full_name: userMetadata.full_name || email.split("@")[0],
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      profileData = newProfile;
    } else if (profileError) {
      throw profileError;
    }

    localStorage.setItem("user", JSON.stringify(profileData));

    return { success: true, user: data.user, profile: profileData };
  } catch (error) {
    // console.error("Sign in error:", error.message);
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("user");
    return { success: true };
  } catch (error) {
    // console.error("Sign out error:", error.message);
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async (source = "login") => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          window.location.origin + `/login?provider=google&source=${source}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    // console.error("Google sign in error:", error.message);
    return { success: false, error: error.message };
  }
};

export const handleGoogleRedirect = async () => {
  try {
    if (localStorage.getItem("admin")) {
      localStorage.removeItem("admin");
    }

    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) throw authError;
    if (!authData.session)
      return { success: false, message: "No session found after Google login" };

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user.id;
    const email = userData.user.email;
    const fullName =
      userData.user.user_metadata.full_name || email.split("@")[0];

    let { data: profileData, error: profileError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from("patients")
          .insert([
            {
              id: userId,
              email: email,
              full_name: fullName,
            },
          ])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            const { data: existingProfile, error: fetchError } = await supabase
              .from("patients")
              .select("*")
              .eq("id", userId)
              .single();

            if (fetchError) throw fetchError;
            profileData = existingProfile;
          } else {
            throw insertError;
          }
        } else {
          profileData = newProfile;
        }
      } catch (insertError) {
        const { data: retryProfile, error: retryError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", userId)
          .single();

        if (retryError) throw retryError;
        profileData = retryProfile;
      }
    } else if (profileError) {
      throw profileError;
    }

    if (profileData && profileData.is_active === false) {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      return { success: false, error: 'حسابك غير نشط. يرجى التواصل مع الدعم.' };
    }

    localStorage.setItem("user", JSON.stringify(profileData));

    return {
      success: true,
      user: userData.user,
      profile: profileData,
      session: authData.session,
    };
  } catch (error) {
    // console.error("Google redirect handling error:", error.message);
    return { success: false, error: error.message };
  }
};

export const checkUserSession = async () => {
  try {
    if (localStorage.getItem("admin")) {
      localStorage.removeItem("admin");
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      return { success: false, message: "No active session" };
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const userId = userData.user.id;

    let { data: profileData, error: profileError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      try {
        const { data: newProfile, error: insertError } = await supabase
          .from("patients")
          .insert([
            {
              id: userId,
              email: userData.user.email,
              full_name:
                userData.user.user_metadata.full_name ||
                userData.user.email.split("@")[0],
            },
          ])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            const { data: existingProfile, error: fetchError } = await supabase
              .from("patients")
              .select("*")
              .eq("id", userId)
              .single();

            if (fetchError) throw fetchError;
            profileData = existingProfile;
          } else {
            throw insertError;
          }
        } else {
          profileData = newProfile;
        }
      } catch (insertError) {
        const { data: retryProfile, error: retryError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", userId)
          .single();

        if (retryError) throw retryError;
        profileData = retryProfile;
      }
    } else if (profileError) {
      throw profileError;
    }

    localStorage.setItem("user", JSON.stringify(profileData));

    return {
      success: true,
      user: userData.user,
      profile: profileData,
      session: sessionData.session,
    };
  } catch (error) {
    console.error("Session check error:", error.message);
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update-password",
    });

    if (error) throw error;

    return {
      success: true,
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    };
  } catch (error) {
    // console.error("Password reset error:", error.message);
    return { success: false, error: error.message };
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, message: "تم تحديث كلمة المرور بنجاح" };
  } catch (error) {
    // console.error("Password update error:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    // console.log("Starting user profile update process");

    const { data: currentUser, error: userError } =
      await supabase.auth.getUser();

    if (userError) {
      // console.error("Error getting current user:", userError);
      throw userError;
    }

    if (!currentUser || !currentUser.user) {
      // console.error("No current user found");
      return { success: false, error: "لم يتم العثور على المستخدم الحالي" };
    }

    const userId = currentUser.user.id;
    const email = currentUser.user.email;

    // console.log("Current user:", { userId, email });

    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        full_name: userData.full_name,
      },
    });

    if (updateAuthError) {
      // console.error("Error updating auth user metadata:", updateAuthError);
      throw updateAuthError;
    }

    // console.log("Auth user metadata updated successfully");
    let { data: profiles, error: checkError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", userId);

    if (checkError) {
      // console.error("Error checking for existing profile:", checkError);
      throw checkError;
    }

    let updatedProfile;

    if (!profiles || profiles.length === 0) {
      // console.log("No existing profile found, creating new profile");
      const insertData = {
        id: userId,
        email: email,
        full_name: userData.full_name,
        phone: userData.phone || null,
        gender: userData.gender || null,
        date_of_birth: userData.date_of_birth || null,
        address: userData.address || null,
      };

      // console.log("Inserting new profile:", insertData);

      const { data: newProfiles, error: insertError } = await supabase
        .from("patients")
        .insert([insertData])
        .select();

      if (insertError) {
        // console.error("Error creating new profile:", insertError);
        throw insertError;
      }

      if (!newProfiles || newProfiles.length === 0) {
        // console.error("Failed to create new profile");
        return { success: false, error: "فشل في إنشاء ملف التعريف الجديد" };
      }

      updatedProfile = newProfiles[0];
      // console.log("New profile created:", updatedProfile);
    } else {
      // console.log("Existing profile found, updating profile");

      const updateData = {
        full_name: userData.full_name,
        phone: userData.phone || null,
        gender: userData.gender || null,
        date_of_birth: userData.date_of_birth || null,
        address: userData.address || null,
      };

      // console.log("Updating profile with data:", updateData);

      const { data: updatedProfiles, error: updateError } = await supabase
        .from("patients")
        .update(updateData)
        .eq("id", userId)
        .select();

      if (updateError) {
        // console.error("Error updating profile:", updateError);
        throw updateError;
      }

      if (!updatedProfiles || updatedProfiles.length === 0) {
        // console.error("Failed to update profile");
        return { success: false, error: "فشل في تحديث ملف التعريف" };
      }

      updatedProfile = updatedProfiles[0];
      // console.log("Profile updated:", updatedProfile);
    }

    localStorage.setItem("user", JSON.stringify(updatedProfile));
    // console.log("Updated user info in localStorage");

    return {
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
      profile: updatedProfile,
    };
  } catch (error) {
    // console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
    };
  }
};

export const checkAdminSession = async () => {
  try {
    if (localStorage.getItem("user")) {
      localStorage.removeItem("user");
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      return { success: false, message: "No active session" };
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const { data: adminData, error: adminError } = await supabase
      .from("dashboard_users")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (adminError) {
      return { success: false, error: "User is not an admin" };
    }

    localStorage.setItem("admin", JSON.stringify(adminData));

    return {
      success: true,
      user: userData.user,
      admin: adminData,
      session: sessionData.session,
    };
  } catch (error) {
    // console.error("Admin session check error:", error.message);
    return { success: false, error: error.message };
  }
};

export const signInAdmin = async (email, password) => {
  try {
    if (localStorage.getItem("user")) {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    let { data: adminData, error: adminError } = await supabase
      .from("dashboard_users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (adminError) {
      if (adminError.code === "PGRST116") {
        await supabase.auth.signOut();
        return {
          success: false,
          error: "User is not authorized as admin",
        };
      }
      throw adminError;
    }

    localStorage.setItem("admin", JSON.stringify(adminData));

    return {
      success: true,
      user: data.user,
      admin: adminData,
    };
  } catch (error) {
    // console.error("Admin sign in error:", error.message);
    return { success: false, error: error.message };
  }
};

export const signOutAdmin = async () => {
  try {
    localStorage.removeItem("admin");

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    // console.error("Sign out error:", error.message);
    return { success: false, error: error.message };
  }
};