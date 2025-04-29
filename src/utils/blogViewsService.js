import { supabase } from "../supabase/supabaseClient";

let viewsCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000;

// Generate a unique session ID if it doesn't exist
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("blogSessionId");
  if (!sessionId) {
    sessionId =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("blogSessionId", sessionId);
  }
  return sessionId;
};

export const getBlogViews = async () => {
  if (
    viewsCache &&
    lastFetchTime &&
    Date.now() - lastFetchTime < CACHE_DURATION
  ) {
    return viewsCache;
  }

  try {
    const { data: viewsData, error } = await supabase
      .from("blog_post_views")
      .select("post_id");

    if (error) throw error;

    const viewsMap = {};
    viewsData?.forEach((view) => {
      viewsMap[view.post_id] = (viewsMap[view.post_id] || 0) + 1;
    });

    viewsCache = viewsMap;
    lastFetchTime = Date.now();

    return viewsMap;
  } catch (error) {
    console.error("Error fetching blog views:", error);
    return {};
  }
};

export const trackPostView = async (postId) => {
  try {
    const viewedPosts = JSON.parse(
      sessionStorage.getItem("viewedBlogPosts") || "[]"
    );

    if (!viewedPosts.includes(postId)) {
      const sessionId = getSessionId();
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      await supabase.from("blog_post_views").insert({
        post_id: postId,
        session_id: sessionId,
        viewer_ip: ip, 
      });

      viewedPosts.push(postId);
      sessionStorage.setItem("viewedBlogPosts", JSON.stringify(viewedPosts));

      viewsCache = null;
    }

    return true;
  } catch (error) {
    console.error("Error tracking post view:", error);
    return false;
  }
};
