import AdminSectionNav from './AdminSectionNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <AdminSectionNav />
      {children}
    </div>
  );
}
