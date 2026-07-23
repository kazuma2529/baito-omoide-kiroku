import React from 'react';
import { Home, History, Calendar as CalendarIcon, User } from 'lucide-react';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'ホーム', icon: <Home className="w-5 h-5 stroke-[2]" /> },
    { id: 'timeline', label: 'バイト歴', icon: <History className="w-5 h-5 stroke-[2]" /> },
    { id: 'calendar', label: 'カレンダー', icon: <CalendarIcon className="w-5 h-5 stroke-[2]" /> },
    { id: 'mypage', label: 'マイページ', icon: <User className="w-5 h-5 stroke-[2]" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#fdfbf7]/95 backdrop-blur-md border-t border-[#ece9e0] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-all cursor-pointer relative ${
                isActive ? 'text-[#ff8e88] font-bold' : 'text-gray-400 hover:text-[#2d3436]'
              }`}
            >
              {tab.icon}
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#ff8e88] rounded-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

