'use client';

import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MobileSupport from './components/MobileSupport';
import './globals.css';

export default function HomePage() {
  return (
    <div className="app">
      <MobileSupport />
      <Sidebar />
      <ChatArea />
    </div>
  );
}
