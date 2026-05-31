import "./admin.css";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  // AdminGuard and AdminShell are applied per-page to allow the login page
  // to render without the sidebar. See each page file.
  return children;
}
