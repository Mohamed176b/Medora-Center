import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../supabase/supabaseClient";
import {
  fetchAllUsersData,
  fetchAllDoctorsData,
  fetchAllServicesData,
  fetchAllMessagesData,
  fetchAllTestimonialsData,
  fetchAllAppointmentsData,
  fetchAllBlogPosts,
} from "../../../redux/slices/adminSlice";
import "../../../style/Analytics.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { getBlogViews } from "../../../utils/blogViewsService";

const Loader = React.lazy(() => import("../../common/Loader"));

const DailyBookingsTrend = memo(({ data }) => (
  <div className="chart-container">
    <h3>تطور الحجوزات</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="bookings" stroke="#d40d37" />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

const BookingStatusPie = memo(({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  return (
    <div className="chart-container">
      <h3>توزيع حالات الحجوزات</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

const TopServicesChart = memo(({ data }) => (
  <div className="chart-container">
    <h3>أكثر الخدمات حجزاً</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#d40d37" />
      </BarChart>
    </ResponsiveContainer>
  </div>
));

const TopPostsTable = memo(({ posts }) => (
  <div className="top-posts-table">
    <h3>أكثر المقالات قراءة</h3>
    <table>
      <thead>
        <tr>
          <th>العنوان</th>
          <th>المشاهدات</th>
        </tr>
      </thead>
      <tbody>
        {posts?.map((post) => (
          <tr key={post.id}>
            <td>{post.title}</td>
            <td>{post.views}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

const Analytics = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.analytics
  );
  const admin = useSelector((state) => state.admin);
  const currentRole = admin?.admin?.role || admin?.admin?.admin?.role;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [siteViews, setSiteViews] = useState(0);

  const users = useSelector((state) => state.admin.allUsersData);
  const doctors = useSelector((state) => state.admin.allDoctorsData);
  const services = useSelector((state) => state.admin.allServicesData);
  const messages = useSelector((state) => state.admin.allMessagesData);
  const testimonials = useSelector((state) => state.admin.allTestimonialsData);
  const appointments = useSelector((state) => state.admin.allAppointmentsData);
  const blogPosts = useSelector((state) => state.admin.allBlogPosts);

  const [overviewData, setOverviewData] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    servicesCount: 0,
    monthlyBookings: 0,
    newMessages: 0,
    reviewedTestimonials: 0,
  });

  const [bookingsData, setBookingsData] = useState({
    dailyTrend: [],
    statusDistribution: [],
    topServices: [],
  });

  const [engagementData, setEngagementData] = useState({
    newUsers: 0,
    messages: { patients: 0, guests: 0 },
    testimonials: { reviewed: 0, pending: 0 },
  });

  const [blogData, setBlogData] = useState({
    totalPosts: 0,
    totalViews: 0,
    topPosts: [],
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        dispatch(fetchAllUsersData()),
        dispatch(fetchAllDoctorsData()),
        dispatch(fetchAllServicesData()),
        dispatch(fetchAllMessagesData()),
        dispatch(fetchAllTestimonialsData()),
        dispatch(fetchAllAppointmentsData()),
        dispatch(fetchAllBlogPosts()),
      ]);
      setLoading(false);
    } catch (error) {
      // console.error("Error loading analytics data:", error);
      setLoading(false);
    }
  }, [dispatch]);

  const fetchSiteViews = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("site_views")
        .select("*", { count: "exact", head: true });
      if (!error) setSiteViews(count || 0);
    } catch (e) {
      setSiteViews(0);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchSiteViews();
  }, [fetchSiteViews]);

  const processBlogData = useCallback(async () => {
    try {
      const viewsMap = await getBlogViews();
      const viewsCount = Object.values(viewsMap).reduce(
        (sum, count) => sum + count,
        0
      );

      const topPosts = blogPosts
        .map((post) => ({
          ...post,
          views: viewsMap[post.id] || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);

      setBlogData({
        totalPosts: blogPosts.length,
        totalViews: viewsCount,
        topPosts,
      });
    } catch (error) {
      // console.error("Error processing blog data:", error);
    }
  }, [blogPosts]);

  const computedOverviewData = useMemo(
    () => ({
      patientsCount: users?.length || 0,
      doctorsCount: doctors?.length || 0,
      servicesCount: services?.length || 0,
      monthlyBookings:
        appointments?.filter((appt) => {
          const date = new Date(appt.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length || 0,
      newMessages: messages?.filter((msg) => !msg.is_read).length || 0,
      reviewedTestimonials:
        testimonials?.filter((t) => t.is_reviewed).length || 0,
    }),
    [users, doctors, services, appointments, messages, testimonials]
  );

  const computedBookingsData = useMemo(() => {
    if (!appointments?.length)
      return { dailyTrend: [], statusDistribution: [], topServices: [] };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = [];
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    };
    const serviceBookings = {};

    appointments.forEach((booking) => {
      if (new Date(booking.created_at) >= thirtyDaysAgo) {
        statusCounts[booking.status]++;

        const serviceName = booking.services?.title || "Unknown";
        serviceBookings[serviceName] = (serviceBookings[serviceName] || 0) + 1;

        const date = new Date(booking.created_at).toLocaleDateString("ar-EG");
        const existingDay = dailyTrend.find((day) => day.date === date);
        if (existingDay) {
          existingDay.bookings++;
        } else {
          dailyTrend.push({ date, bookings: 1 });
        }
      }
    });

    // Map English status to Arabic labels
    const statusLabels = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "مكتمل",
    };

    return {
      dailyTrend: dailyTrend.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
      statusDistribution: Object.entries(statusCounts).map(
        ([status, count]) => ({
          status: statusLabels[status] || status,
          count,
        })
      ),
      topServices: Object.entries(serviceBookings)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    };
  }, [appointments]);

  const computedEngagementData = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
      newUsers:
        users?.filter((user) => new Date(user.created_at) >= sevenDaysAgo)
          .length || 0,
      messages: {
        patients: messages?.filter((msg) => msg.patient_id).length || 0,
        guests: messages?.filter((msg) => !msg.patient_id).length || 0,
      },
      testimonials: {
        reviewed: testimonials?.filter((t) => t.is_reviewed).length || 0,
        pending: testimonials?.filter((t) => !t.is_reviewed).length || 0,
      },
    };
  }, [users, messages, testimonials]);

  useEffect(() => {
    if (
      !loading &&
      users &&
      doctors &&
      services &&
      appointments &&
      messages &&
      testimonials &&
      isAuthorized
    ) {
      setOverviewData(computedOverviewData);
      setBookingsData(computedBookingsData);
      setEngagementData(computedEngagementData);
      processBlogData();
    }
  }, [
    loading,
    users,
    doctors,
    services,
    appointments,
    messages,
    testimonials,
    isAuthorized,
    computedOverviewData,
    computedBookingsData,
    computedEngagementData,
    processBlogData
  ]);// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const logData = async () => {
      console.log('Loading state:', loading);
      console.log('Users data:', users);
      console.log('Doctors data:', doctors);
      console.log('Services data:', services);
      console.log('Appointments data:', appointments);
      console.log('Computed Overview:', computedOverviewData);
      console.log('Computed Bookings:', computedBookingsData);
      console.log('Computed Engagement:', computedEngagementData);
    };
    logData();
  }, [loading, users, doctors, services, appointments, computedOverviewData, computedBookingsData, computedEngagementData]);
  if (!isAuthorized) {
    return unauthorizedUI;
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">لوحة التحليلات</h1>

      {/* Overview Cards */}
      <section className="overview-section">
        <h2>نظرة سريعة</h2>
        <div className="stats-grid">
          {currentRole !== "admin" && (
            <div className="stat-card">
              <i className="fa-solid fa-users"></i>
              <div>
                <div className="stat-card-title">عدد المرضى</div>
                <div className="stat-card-value">
                  {overviewData.patientsCount}
                </div>
              </div>
            </div>
          )}
          <div className="stat-card">
            <i className="fa-solid fa-user-md"></i>
            <div>
              <div className="stat-card-title">عدد الأطباء</div>
              <div className="stat-card-value">{overviewData.doctorsCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-eye"></i>
            <div>
              <div className="stat-card-title">مشاهدات الموقع</div>
              <div className="stat-card-value">{siteViews}</div>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-eye"></i>
            <div>
              <div className="stat-card-title">مشاهدات المقالات</div>
              <div className="stat-card-value">{blogData.totalViews}</div>
            </div>
          </div>
          <div className="stat-card">
            <i className="fa-solid fa-calendar-check"></i>
            <div>
              <div className="stat-card-title">الحجوزات هذا الشهر</div>
              <div className="stat-card-value">
                {overviewData.monthlyBookings}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Analytics */}
      <section className="booking-analytics-section">
        <h2>تحليلات الحجوزات</h2>
        <div className="charts-grid">
          <DailyBookingsTrend data={bookingsData.dailyTrend} />
          <BookingStatusPie data={bookingsData.statusDistribution} />
          <TopServicesChart data={bookingsData.topServices} />
        </div>
      </section>

      {/* Blog Analytics */}
      <section className="blog-analytics-section">
        <h2>تحليلات المحتوى</h2>
        <TopPostsTable posts={blogData.topPosts} />
      </section>

      {/* User Engagement Section */}
      <section className="engagement-section">
        <h2>تفاعل المستخدمين</h2>
        <div className="engagement-grid">
          {/* New Users Card */}
          {currentRole !== "admin" && (
            <div className="engagement-card">
              <div className="engagement-header">
                <i className="fas fa-user-plus"></i>
                <h3>المستخدمون الجدد</h3>
                <p className="period">آخر 7 أيام</p>
              </div>
              <div className="engagement-value">{engagementData.newUsers}</div>
            </div>
          )}
          {/* Messages Distribution */}
          <div className="engagement-card">
            <div className="engagement-header">
              <i className="fas fa-envelope"></i>
              <h3>توزيع الرسائل</h3>
            </div>
            <div className="messages-stats">
              <div className="message-stat">
                <span className="label">المرضى:</span>
                <span className="value">
                  {engagementData.messages.patients}
                </span>
              </div>
              <div className="message-stat">
                <span className="label">الزوار:</span>
                <span className="value">{engagementData.messages.guests}</span>
              </div>
            </div>
          </div>

          {/* Testimonials Status */}
          <div className="engagement-card">
            <div className="engagement-header">
              <i className="fas fa-comments"></i>
              <h3>حالة التقييمات</h3>
            </div>
            <div className="testimonials-stats">
              <div className="testimonial-stat">
                <span className="label">تمت المراجعة:</span>
                <span className="value approved">
                  {engagementData.testimonials.reviewed}
                </span>
              </div>
              <div className="testimonial-stat">
                <span className="label">في الانتظار:</span>
                <span className="value pending">
                  {engagementData.testimonials.pending}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(Analytics);
