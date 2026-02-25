import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-60">
        <Header userName="사용자" userEmail="user@gmail.com" upcomingCount={3} />
        <main className="p-6 page-enter">{children}</main>
      </div>
    </div>
  );
}
