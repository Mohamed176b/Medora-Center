import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Medora Logo"
            style={{ width: "200px", marginBottom: "20px" }}
          />
          <h1 style={{ margin: "50px auto", textAlign: "center" }}>
            حدث خطأ ما. الرجاء اعادة تحميل الصفحة او المحاولة لاحقًا.
          </h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
