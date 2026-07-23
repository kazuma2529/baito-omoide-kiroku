import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Download, BookOpen, ShieldCheck, User } from 'lucide-react';

export const MyPageTab: React.FC = () => {
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('ホーム画面への追加は、ブラウザの共有メニューから「ホーム画面に追加」をタップしてください。');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-6 shadow-2xs text-center space-y-3">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'ユーザー'}
            className="w-20 h-20 rounded-full border-2 border-[#ff8e88] object-cover mx-auto shadow-2xs"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#ff8e88] text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-2xs font-serif-accent">
            {(user?.displayName || 'ユ')[0]}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold font-serif-accent text-[#2d3436]">
            {user?.displayName || 'ゲストユーザー'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {user?.email || '未設定'}
          </p>
          {user?.isDemo && (
            <span className="inline-block mt-2 text-[10px] font-bold bg-[#5fb194]/15 text-[#5fb194] px-3 py-1 rounded-full">
              デモモードで利用中
            </span>
          )}
        </div>
      </div>

      {/* PWA Install Guide */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2d3436]">
          <Download className="w-4 h-4 text-[#ff8e88]" />
          <span>アプリのインストール (PWA)</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          スマートフォンやPCのホーム画面に追加すると、ネイティブアプリのようにすばやく起動・記録できます。
        </p>

        {isInstalled ? (
          <div className="p-3 bg-[#5fb194]/10 text-[#2d3436] rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#5fb194]" />
            <span>ホーム画面にインストール済みです</span>
          </div>
        ) : (
          <button
            onClick={handleInstallPWA}
            className="w-full min-h-[44px] bg-[#fdfbf7] hover:bg-[#ff8e88]/10 border border-[#ece9e0] text-[#ff8e88] font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ホーム画面に追加する</span>
          </button>
        )}
      </div>

      {/* App Info Card */}
      <div className="bg-white border border-[#ece9e0] rounded-3xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2d3436]">
          <BookOpen className="w-4 h-4 text-[#5fb194]" />
          <span>アプリについて</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          「バイトの思い出記録」は、これまで経験したアルバイトの歩みをシンプルに綴るスクラップブックです。<br />
          給与や勤務時間の管理は行わず、「いつどんな体験をしたか」に特化しています。
        </p>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full min-h-[48px] bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold py-3 px-4 rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
};
