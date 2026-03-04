// Auth Layout - No header, sidebar, footer for login/signup pages
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

