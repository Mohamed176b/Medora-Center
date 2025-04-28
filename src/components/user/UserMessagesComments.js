import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserMessages,
  fetchUserTestimonials,
  createUserMessage,
  createUserTestimonial,
  deleteUserMessage,
  deleteUserTestimonial,
} from "../../redux/slices/userSlice";
import useToast from "../../hooks/useToast";
import "../../style/UserMessagesComments.css";
import Loader from "../common/Loader";

const UserMessagesComments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { messages, testimonials, messagesLoading, testimonialsLoading } =
    useSelector((state) => state.user);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("messages");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [messageData, setMessageData] = useState({
    subject: "",
    message: "",
  });
  const [testimonialData, setTestimonialData] = useState({
    content: "",
    rating: 5,
  });

  useEffect(() => {
    if (user) {
      if (!messages || messages.length === 0) {
        dispatch(fetchUserMessages(user.id));
      }
      if (!testimonials || testimonials.length === 0) {
        dispatch(fetchUserTestimonials(user.id));
      }
    }
  }, [dispatch, user]);

  const handleMessageChange = (e) => {
    const { name, value } = e.target;
    setMessageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestimonialChange = (e) => {
    const { name, value } = e.target;
    setTestimonialData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleRatingClick = (rating) => {
    setTestimonialData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const submitMessage = async (e) => {
    e.preventDefault();

    if (!messageData.subject || !messageData.message) {
      toast("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createUserMessage({ userId: user.id, messageData })
      ).unwrap();
      toast("تم إرسال رسالتك بنجاح", "success");
      setMessageData({ subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting message:", error);
      toast("حدث خطأ أثناء إرسال الرسالة", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();

    if (!testimonialData.content) {
      toast("يرجى كتابة تعليقك", "error");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createUserTestimonial({ userId: user.id, testimonialData })
      ).unwrap();
      toast("تم إرسال تقييمك بنجاح، سيتم مراجعته قبل النشر", "success");
      setTestimonialData({ content: "", rating: 5 });
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast("حدث خطأ أثناء إرسال التقييم", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      try {
        await dispatch(
          deleteUserMessage({ messageId: id, userId: user.id })
        ).unwrap();
        toast("تم حذف الرسالة بنجاح", "success");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast("حدث خطأ أثناء حذف الرسالة", "error");
      }
    }
  };

  const deleteTestimonial = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      try {
        await dispatch(
          deleteUserTestimonial({ testimonialId: id, userId: user.id })
        ).unwrap();
        toast("تم حذف التقييم بنجاح", "success");
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        toast("حدث خطأ أثناء حذف التقييم", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  if (messagesLoading || testimonialsLoading) {
    return <Loader />;
  }

  return (
    <div className="user-interactions-container">
      <div className="interactions-header">
        <h1>الرسائل والتعليقات</h1>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            الرسائل
          </button>
          <button
            className={`tab-button ${
              activeTab === "testimonials" ? "active" : ""
            }`}
            onClick={() => setActiveTab("testimonials")}
          >
            التقييمات
          </button>
        </div>
      </div>

      <div className="interactions-content">
        {activeTab === "messages" ? (
          <div className="messages-section">
            <div className="new-message-form">
              <h2>إرسال رسالة جديدة</h2>
              <form onSubmit={submitMessage}>
                <div className="form-group">
                  <label htmlFor="subject">الموضوع</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={messageData.subject}
                    onChange={handleMessageChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">الرسالة</label>
                  <textarea
                    id="message"
                    name="message"
                    value={messageData.message}
                    onChange={handleMessageChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="send-button"
                  disabled={submitting}
                >
                  {submitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            </div>

            <div className="messages-list">
              <h2>رسائلك السابقة</h2>
              {messages.length === 0 ? (
                <p className="no-data-message">لم ترسل أي رسائل حتى الآن</p>
              ) : (
                <div className="messages-items">
                  {messages.map((msg) => (
                    <div className="message-item" key={msg.id}>
                      <div className="message-header">
                        <h3>{msg.subject}</h3>
                        <button
                          className="delete-button"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          حذف
                        </button>
                      </div>
                      <p className="message-content">{msg.message}</p>
                      <div className="message-footer">
                        <span className="message-date">
                          {formatDate(msg.sent_at)}
                        </span>
                        <span className="message-status">
                          {msg.is_read ? "تمت القراءة" : "لم تتم القراءة بعد"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="testimonials-section">
            <div className="new-testimonial-form">
              <h2>إضافة تقييم جديد</h2>
              <form onSubmit={submitTestimonial}>
                <div className="form-group">
                  <label htmlFor="rating">التقييم</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`rating-star ${
                          star <= testimonialData.rating ? "filled" : "empty"
                        }`}
                        onClick={() => handleRatingClick(star)}
                      >
                        {star <= testimonialData.rating ? "★" : "☆"}
                      </span>
                    ))}
                    <span className="rating-text">
                      {testimonialData.rating} من 5
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="content">التعليق</label>
                  <textarea
                    id="content"
                    name="content"
                    value={testimonialData.content}
                    onChange={handleTestimonialChange}
                    rows="4"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="send-button"
                  disabled={submitting}
                >
                  {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                </button>
              </form>
            </div>

            <div className="testimonials-list">
              <h2>تقييماتك السابقة</h2>
              {testimonials.length === 0 ? (
                <p className="no-data-message">لم تضف أي تقييمات حتى الآن</p>
              ) : (
                <div className="testimonials-items">
                  {testimonials.map((testimonial) => (
                    <div className="testimonial-item" key={testimonial.id}>
                      <div className="testimonial-header">
                        <div className="testimonial-rating">
                          {Array.from(
                            { length: testimonial.rating },
                            (_, i) => (
                              <span key={i} className="star">
                                ★
                              </span>
                            )
                          )}
                          {Array.from(
                            { length: 5 - testimonial.rating },
                            (_, i) => (
                              <span key={i} className="star empty">
                                ☆
                              </span>
                            )
                          )}
                        </div>
                        <button
                          className="delete-button"
                          onClick={() => deleteTestimonial(testimonial.id)}
                        >
                          حذف
                        </button>
                      </div>
                      <p className="testimonial-content">
                        {testimonial.content}
                      </p>
                      <div className="testimonial-footer">
                        <span className="testimonial-date">
                          {formatDate(testimonial.created_at)}
                        </span>
                        <span className="testimonial-status">
                          {testimonial.is_reviewed
                            ? "تمت الموافقة"
                            : "قيد المراجعة"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessagesComments;
