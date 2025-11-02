import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './AdminDashboardClient'; // New client component

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.isAdmin) {
    // Redirect to login if not authenticated or not an admin
    redirect('/auth/signin?callbackUrl=/admin');
  }

  // Pass user name/email to the client component, ensuring it's a string
  const userName = session.user.name ?? session.user.email ?? 'Admin User';

  return (
    <AdminDashboardClient userName={userName} />
  );
}
