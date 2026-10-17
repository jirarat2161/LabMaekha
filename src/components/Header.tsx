import React from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Printer,
  LogOut,
  RefreshCw,
  PlusCircle,
  Database
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  spreadsheetId: string | null;
  spreadsheetTitle: string | null;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSheetModal: () => void;
  onOpenAddRecord: () => void;
  onOpenReport: () => void;
  onRefreshData: () => void;
  activeTab: 'overview' | 'charts' | 'table' | 'network-cost';
  setActiveTab: (tab: 'overview' | 'charts' | 'table' | 'network-cost') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  spreadsheetId,
  spreadsheetTitle,
  isSyncing,
  onLogin,
  onLogout,
  onOpenSheetModal,
  onOpenAddRecord,
  onOpenReport,
  onRefreshData,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      {/* Top Banner with clinic logo and auth actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Clinic Branding */}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
                ระบบรายงานสถิติ & สรุปผลงาน
              </span>
              <span className="text-[11px] text-slate-400 font-medium">| เทศบาลนครเชียงใหม่</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              งานห้องปฏิบัติการทางการแพทย์
              <span className="text-sm font-semibold text-emerald-700 hidden sm:inline">
                ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
              </span>
            </h1>
            <p className="text-xs text-slate-500 sm:hidden">ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า</p>
          </div>

          {/* Controls: Google Auth & Sheet Connection */}
          <div className="flex items-center flex-wrap gap-2.5">
            {user ? (
              <>
                {/* Google Sheet status badge */}
                <button
                  onClick={onOpenSheetModal}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs hover:shadow-xs group cursor-pointer bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300"
                  title="คลิกเพื่อจัดการหรือเปลี่ยน Google Sheet"
                >
                  <FileSpreadsheet className={`w-4 h-4 ${spreadsheetId ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${spreadsheetId ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span className="font-semibold text-slate-800">
                        {spreadsheetId ? (spreadsheetTitle || 'เชื่อมต่อ Google Sheet แล้ว') : 'ยังไม่ได้ผูก Sheet'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Refresh data button */}
                <button
                  onClick={onRefreshData}
                  disabled={isSyncing}
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  title="ซิงค์ข้อมูลล่าสุดจาก Google Sheets"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                </button>

                {/* Quick Add Record Button */}
                <button
                  onClick={onOpenAddRecord}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกผลงาน</span>
                </button>

                {/* Print Report Button */}
                <button
                  onClick={onOpenReport}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">พิมพ์รายงาน</span>
                </button>

                {/* User Info & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.displayName || 'เจ้าหน้าที่ห้องแล็บ'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="ออกจากระบบ Google"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSheetModal}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ดูโหมดตัวอย่าง (Demo)</span>
                </button>

                {/* Official Google Sign-in button */}
                <button onClick={onLogin} className="gsi-material-button">
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents font-medium text-xs">
                      Sign in with Google
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100/70 border-t border-slate-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1 sm:space-x-3 py-1.5" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📊 ภาพรวมสถิติ & ตัวชี้วัด (Overview)
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📈 กราฟแนวโน้ม & งานบริการ (Trends)
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📋 ตารางบันทึกผลงาน (Data Records)
            </button>
            <button
              onClick={() => setActiveTab('network-cost')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'network-cost'
                  ? 'bg-white text-amber-700 shadow-2xs border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              💰 ต้นทุนเครือข่าย 15 แห่ง (Network Costs)
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>มาตรฐานงานเทคนิคการแพทย์ชุมชน & NCD Clinic</span>
          </div>
        </div>
      </div>
    </header>
  );
};
