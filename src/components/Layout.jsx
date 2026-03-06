import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      {/* Main content: full width on mobile, offset by sidebar on desktop */}
      <main className={`flex-1 p-4 sm:p-8 bg-gray-100 dark:bg-gray-950 transition-all duration-300 pt-[72px] md:pt-8 pb-20 md:pb-8 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {children}
      </main>
    </div>
  );
}
