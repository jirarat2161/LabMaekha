import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  Plus,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

interface SheetConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSpreadsheetId: string | null;
  spreadsheetTitle: string | null;
  onConnectSpreadsheet: (input: string) => Promise<void>;
  onCreateNewTemplate: () => Promise<void>;
  onUseDemoData: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

export const SheetConnectionModal: React.FC<SheetConnectionModalProps> = ({
  isOpen,
  onClose,
  currentSpreadsheetId,
  spreadsheetTitle,
  onConnectSpreadsheet,
  onCreateNewTemplate,
  onUseDemoData,
  isLoggedIn,
  isLoading,
  errorMessage,
}) => {
  const [sheetInput, setSheetInput] = useState(currentSpreadsheetId || '');
  const [activeTab, setActiveTab] = useState<'connect' | 'create' | 'guide'>('connect');

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;
    await onConnectSpreadsheet(sheetInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                เชื่อมต่อฐานข้อมูล Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                งานห้องปฏิบัติการทางการแพทย์ ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Alert */}
        <div className="px-6 pt-4">
          {currentSpreadsheetId ? (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">กำลังเชื่อมต่อกับ: </span>
                  <span className="font-medium text-emerald-900">{spreadsheetTitle || currentSpreadsheetId}</span>
                </div>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline shrink-0"
              >
                <span>เปิดใน Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  กำลังแสดงข้อมูลตัวอย่าง (Demo Data) ของศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ระบุลิงก์หรือ Spreadsheet ID
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            สร้างแผ่นงานแม่แบบอัตโนมัติ
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            คำแนะนำโครงสร้างชีต
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">ข้อผิดพลาดในการเชื่อมต่อ:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Google Spreadsheet URL หรือ Spreadsheet ID:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X... หรือ ID"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
                  สามารถคัดลอกลิงก์จากแถบเบราว์เซอร์ของ Google Sheet ที่ต้องการมาวางได้ทันที
                </p>
              </div>

              {!isLoggedIn && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  ⚠️ โปรดเข้าสู่ระบบด้วย Google (Sign in with Google) ที่แถบด้านบน เพื่อให้แอพสามารถเข้าถึง Google Sheets ของท่านได้
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onUseDemoData}
                  className="text-xs font-medium text-slate-600 hover:text-emerald-700 hover:underline"
                >
                  สลับใช้โหมดข้อมูลจำลอง (Demo Mode)
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    ปิด
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !sheetInput.trim() || !isLoggedIn}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      'เชื่อมต่อข้อมูล'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'create' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>ระบบสร้างแผ่นงานมาตรฐานทางการแพทย์ให้อัตโนมัติ</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ระบบจะสร้าง Google Sheet ใหม่ใน Google Drive ของคุณ โดยมีหัวตารางพร้อมใช้งาน
                  ทั้งตารางบันทึกผลงานห้องแล็บรายวัน และตารางสรุปสถิติประจำเดือนของศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
                </p>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pt-1">
                  <li>แท็บที่ 1: <strong>บันทึกงานรายวัน</strong> (Daily Lab Log)</li>
                  <li>แท็บที่ 2: <strong>สรุปรายเดือน</strong> (Monthly Statistics)</li>
                  <li>แท็บที่ 3: <strong>ต้นทุนแลปเครือข่าย15แห่ง</strong> (15 Network Units Lab Costs)</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isLoading || !isLoggedIn}
                  onClick={onCreateNewTemplate}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? 'กำลังสร้าง Google Sheet...' : 'สร้าง Google Sheet แม่แบบเดี๋ยวนี้'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>คอลัมน์มาตรฐานสำหรับแผ่นงาน "บันทึกงานรายวัน"</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
                คอลัมน์ A: วันที่ (เช่น 2026-10-15)<br />
                คอลัมน์ B: หมวดหมู่งาน (Hematology, Clinical Chemistry, ฯลฯ)<br />
                คอลัมน์ C: รายการตรวจวิเคราะห์ (CBC, FBS, HbA1c, UA, FOBT)<br />
                คอลัมน์ D: ผู้รับบริการ (คน)<br />
                คอลัมน์ E: จำนวนการทดสอบ (Tests)<br />
                คอลัมน์ F: รายงานผลตามเกณฑ์ TAT (ครั้ง)<br />
                คอลัมน์ G: รายงานค่าวิกฤต (ครั้ง)<br />
                คอลัมน์ H: ปฏิเสธสิ่งส่งตรวจ (ครั้ง)<br />
                คอลัมน์ I: ผู้บันทึก/นักเทคนิคการแพทย์<br />
                คอลัมน์ J: หมายเหตุ
              </div>
              <p className="text-[11px] text-slate-500">
                💡 ข้อแนะนำ: คุณสามารถใช้ปุ่ม "สร้างแผ่นงานแม่แบบอัตโนมัติ" ในแท็บที่ 2 เพื่อให้ระบบเตรียมหัวตารางเหล่านี้ให้โดยอัตโนมัติในคลิกเดียว
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
