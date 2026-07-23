import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#ece9e0] px-4 py-3 shadow-2xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ff8e88] text-white flex items-center justify-center font-serif-accent italic font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <h1 className="text-base font-bold font-serif-accent text-[#2d3436] leading-none tracking-wide">
              バイトの思い出
            </h1>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
              あなたの足跡を優しく綴るスクラップブック
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'ユーザー'}
                className="w-8 h-8 rounded-full border border-[#ece9e0] object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#5fb194] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {(user.displayName || 'ユ')[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

