import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, TestTube } from 'lucide-react';
import { LabDailyRecord } from '../types/lab';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: Omit<LabDailyRecord, 'id'>) => Promise<void>;
  defaultOperator?: string;
  isLoading: boolean;
}

const COMMON_TESTS = [
  { name: 'Complete Blood Count (CBC)', cat: 'Hematology' as const },
  { name: 'Fasting Blood Sugar (FBS)', cat: 'Clinical Chemistry' as const },
  { name: 'Hemoglobin A1c (HbA1c) สำหรับคลินิก NCD', cat: 'Clinical Chemistry' as const },
  { name: 'Lipid Profile (Cholesterol, TG, HDL, LDL)', cat: 'Clinical Chemistry' as const },
  { name: 'Renal Function (BUN, Creatinine, eGFR)', cat: 'Clinical Chemistry' as const },
  { name: 'Liver Function (AST, ALT, ALP)', cat: 'Clinical Chemistry' as const },
  { name: 'Urinalysis (UA)', cat: 'Clinical Microscopy' as const },
  { name: 'FOBT (คัดกรองมะเร็งลำไส้ใหญ่ด้วย Fit test)', cat: 'Screening/NCD' as const },
  { name: 'Anti-HIV & VDRL/Syphilis (คลินิก ANC/VCT)', cat: 'Immunology/Serology' as const },
  { name: 'HBsAg & Anti-HBs Rapid Test', cat: 'Immunology/Serology' as const },
  { name: 'Urine hCG (Pregnancy Test)', cat: 'Immunology/Serology' as const },
];

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  defaultOperator = 'ทนพญ.จิรารัตน์ เครืออุดม',
  isLoading,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<LabDailyRecord['category']>('Hematology');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [patientCount, setPatientCount] = useState<number>(10);
  const [testCount, setTestCount] = useState<number>(10);
  const [tatOnTimeCount, setTatOnTimeCount] = useState<number>(10);
  const [criticalCount, setCriticalCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [operator, setOperator] = useState(defaultOperator);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectQuickTest = (item: { name: string; cat: LabDailyRecord['category'] }) => {
    setTestName(item.name);
    setCategory(item.cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    await onSaveRecord({
      date,
      category,
      testName: testName.trim(),
      patientCount: Number(patientCount) || 0,
      testCount: Number(testCount) || 0,
      tatOnTimeCount: Number(tatOnTimeCount) || 0,
      criticalCount: Number(criticalCount) || 0,
      rejectedCount: Number(rejectedCount) || 0,
      operator: operator.trim() || 'เจ้าหน้าที่ห้องปฏิบัติการ',
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                บันทึกผลงานห้องปฏิบัติการทางการแพทย์
              </h3>
              <p className="text-xs text-slate-500">
                ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า | ข้อมูลจะถูกบันทึกลง Google Sheets ทันที
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Quick templates chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>เลือกรายการตรวจยอดนิยมด่วน:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TESTS.slice(0, 6).map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectQuickTest(item)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                    testName === item.name
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.name.split(' ')[0]} {item.name.includes('CBC') ? 'CBC' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ตรวจ:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่งาน:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Hematology">โลหิตวิทยา (Hematology)</option>
                <option value="Clinical Chemistry">เคมีคลินิก (Clinical Chemistry)</option>
                <option value="Immunology/Serology">ภูมิคุ้มกันวิทยาและเซรุ่ม (Serology)</option>
                <option value="Clinical Microscopy">จุลทรรศนศาสตร์คลินิก (Microscopy)</option>
                <option value="Screening/NCD">คัดกรองสุขภาพชุมชน & NCDs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายการตรวจวิเคราะห์ (Test Name):
            </label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="เช่น Complete Blood Count (CBC) หรือ FBS"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผู้รับบริการ (คน):
              </label>
              <input
                type="number"
                min="0"
                required
                value={patientCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPatientCount(val);
                  if (testCount < val) setTestCount(val);
                  if (tatOnTimeCount < val) setTatOnTimeCount(val);
                }}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนการทดสอบ (Tests):
              </label>
              <input
                type="number"
                min="0"
                required
                value={testCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTestCount(val);
                  setTatOnTimeCount(val);
                }}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายงานตามเกณฑ์ TAT:
              </label>
              <input
                type="number"
                min="0"
                value={tatOnTimeCount}
                onChange={(e) => setTatOnTimeCount(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                พบค่าวิกฤต (ครั้ง):
              </label>
              <input
                type="number"
                min="0"
                value={criticalCount}
                onChange={(e) => setCriticalCount(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปฏิเสธสิ่งส่งตรวจ:
              </label>
              <input
                type="number"
                min="0"
                value={rejectedCount}
                onChange={(e) => setRejectedCount(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้บันทึกผล:</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="ชื่อ-สกุล นักเทคนิคการแพทย์"
                className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / การแจ้งค่าวิกฤต / สรุปความผิดปกติ:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น แจ้งแพทย์ประจำคลินิกทันที, สิ่งส่งตรวจมีลิ่มเลือด, คัดกรองกลุ่มเสี่ยงชุมชน ฯลฯ"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || !testName.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                'บันทึกลง Google Sheets'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
