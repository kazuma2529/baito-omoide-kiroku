import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginDemoUser, authError } = useAuth();

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Organic background accent shapes */}
      <div className="absolute top-12 left-8 w-24 h-24 bg-[#ff8e88]/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-12 right-8 w-32 h-32 bg-[#5fb194]/15 rounded-full blur-xl pointer-events-none" />

      <div className="w-full max-w-sm bg-white border border-[#ece9e0] rounded-3xl p-6 sm:p-8 shadow-2xs text-center relative z-10">
        {/* Top Scrapbook Icon Badge */}
        <div className="w-16 h-16 bg-[#f9e2d2] text-[#ff8e88] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xs">
          <BookOpen className="w-8 h-8 stroke-[1.75]" />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold font-serif-accent text-[#2d3436] mb-2 tracking-wide">
          バイトの思い出記録
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
          「いつ、どのようなバイトをして、どのように感じたか」<br />
          自分だけのバイトの歴史をシンプルに残すスクラップブック
        </p>

        {authError && (
          <div className="mb-5 p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100">
            {authError}
          </div>
        )}

        {/* Main Google Login Button */}
        <button
          onClick={loginWithGoogle}
          className="w-full min-h-[48px] bg-white hover:bg-[#fdfbf7] border border-[#ece9e0] text-[#2d3436] font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-3 shadow-2xs hover:border-[#ff8e88] transition-all active:scale-[0.98] cursor-pointer mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.2 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.15 0 9.99 0 12s.44 3.85 1.23 5.42l4.05-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.2 2.7 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Googleアカウントでログイン</span>
        </button>

        {/* Demo Mode Button */}
        <button
          onClick={loginDemoUser}
          className="w-full min-h-[44px] bg-[#5fb194]/15 hover:bg-[#5fb194]/25 text-[#2d3436] font-semibold py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-2 text-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#5fb194]" />
          <span>デモモードで体験する（ログイン不要）</span>
        </button>

        {/* Footnote */}
        <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
          お金（時給・給与）の記録は行いません。<br />
          あなたの思い出と感想だけを大切に残します。
        </p>
      </div>
    </div>
  );
};

