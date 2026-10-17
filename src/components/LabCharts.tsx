import React, { useState } from 'react';
import { LabMonthlySummary } from '../types/lab';
import { BarChart3, TrendingUp, PieChart, Activity, Check } from 'lucide-react';

interface LabChartsProps {
  monthlySummaries: LabMonthlySummary[];
}

export const LabCharts: React.FC<LabChartsProps> = ({ monthlySummaries }) => {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(monthlySummaries.length - 1);

  const selectedMonth = monthlySummaries[selectedMonthIdx] || monthlySummaries[0];

  const maxTests = Math.max(...monthlySummaries.map((m) => m.testsCount), 5000);
  const maxPatients = Math.max(...monthlySummaries.map((m) => m.patientsCount), 1500);

  // Category totals for donut/distribution
  const totalHematology = monthlySummaries.reduce((sum, item) => sum + item.hematologyTests, 0);
  const totalChemistry = monthlySummaries.reduce((sum, item) => sum + item.chemistryTests, 0);
  const totalSerology = monthlySummaries.reduce((sum, item) => sum + item.serologyTests, 0);
  const totalMicroscopy = monthlySummaries.reduce((sum, item) => sum + item.microscopyTests, 0);
  const totalScreening = monthlySummaries.reduce((sum, item) => sum + item.screeningTests, 0);
  const grandTotal = totalHematology + totalChemistry + totalSerology + totalMicroscopy + totalScreening || 1;

  const categories = [
    { name: 'เคมีคลินิก (Clinical Chemistry)', count: totalChemistry, color: '#0d9488', hex: 'bg-teal-600' },
    { name: 'โลหิตวิทยา (Hematology)', count: totalHematology, color: '#059669', hex: 'bg-emerald-600' },
    { name: 'จุลทรรศนศาสตร์ (Microscopy)', count: totalMicroscopy, color: '#0891b2', hex: 'bg-cyan-600' },
    { name: 'ภูมิคุ้มกันวิทยา (Serology)', count: totalSerology, color: '#4f46e5', hex: 'bg-indigo-600' },
    { name: 'คัดกรองเชิงรุก (Screening)', count: totalScreening, color: '#e11d48', hex: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Chart 1: Monthly Test & Patient Volume */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>แนวโน้มจำนวนการตรวจวิเคราะห์และผู้รับบริการรายเดือน</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่แท่งกราฟของแต่ละเดือนเพื่อดูสถิติเจาะจง
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-600 rounded-xs"></span>
              <span className="text-slate-600 font-medium">จำนวนการตรวจ (Tests)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-teal-400 rounded-xs"></span>
              <span className="text-slate-600 font-medium">ผู้รับบริการ (คน)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-6 pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[650px] h-64 flex items-end justify-between gap-3 px-2">
            {monthlySummaries.map((m, idx) => {
              const testHeightPercent = Math.round((m.testsCount / maxTests) * 100);
              const patientHeightPercent = Math.round((m.patientsCount / maxPatients) * 100);
              const isSelected = selectedMonthIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMonthIdx(idx)}
                  className={`flex-1 flex flex-col items-center group cursor-pointer focus:outline-none transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Tooltip value */}
                  <div
                    className={`text-[10px] font-bold mb-2 transition-all ${
                      isSelected
                        ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full scale-105'
                        : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                  >
                    {m.testsCount.toLocaleString()}
                  </div>

                  {/* Dual Bar Container */}
                  <div className="w-full flex items-end justify-center gap-1.5 h-44 bg-slate-50/80 rounded-t-lg p-1 border-b-2 border-slate-300 group-hover:bg-slate-100 transition-colors">
                    {/* Tests bar */}
                    <div
                      style={{ height: `${testHeightPercent}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-sm'
                          : 'bg-emerald-600 group-hover:bg-emerald-500'
                      }`}
                      title={`${m.month}: ${m.testsCount} tests`}
                    />
                    {/* Patients bar */}
                    <div
                      style={{ height: `${patientHeightPercent}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-teal-500 to-teal-400'
                          : 'bg-teal-400 group-hover:bg-teal-300'
                      }`}
                      title={`${m.month}: ${m.patientsCount} ผู้รับบริการ`}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                      isSelected ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {m.month.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Detail Card */}
        {selectedMonth && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-slate-500 font-medium">เดือนที่เลือก:</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedMonth.month}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">ผู้รับบริการ:</p>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">
                {selectedMonth.patientsCount.toLocaleString()} คน
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">การตรวจวิเคราะห์:</p>
              <p className="font-bold text-teal-700 text-sm mt-0.5">
                {selectedMonth.testsCount.toLocaleString()} รายการ
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">% TAT ตามเกณฑ์:</p>
              <p className="font-bold text-cyan-700 text-sm mt-0.5">
                {selectedMonth.tatTargetPercent}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Category Breakdown & Turnaround Time Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>สัดส่วนงานตรวจวิเคราะห์แยกสาขา</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">สะสมทั้งปี</span>
          </div>

          <div className="space-y-3.5">
            {categories.map((cat, idx) => {
              const percent = ((cat.count / grandTotal) * 100).toFixed(1);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="font-bold text-slate-900">
                      {cat.count.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cat.hex}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
            💡 <strong>สรุปสาระสำคัญ:</strong> งานเคมีคลินิกและโลหิตวิทยาคิดเป็นกว่า 80%
            ของภาระงานทั้งหมด โดยส่วนใหญ่รองรับคลินิกโรคไม่ติดต่อเรื้อรัง (NCD Clinic) และการตรวจคัดกรองเบาหวาน-ความดัน
          </div>
        </div>

        {/* TAT & Quality Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>อัตราการรายงานผลตามเกณฑ์ TAT รายเดือน</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              เป้าหมาย ≥ 95%
            </span>
          </div>

          {/* TAT line representation */}
          <div className="space-y-3">
            {monthlySummaries.slice(-6).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="w-24 font-semibold text-slate-700">{m.month}</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 rounded-full"
                    style={{ width: `${Math.min(m.tatTargetPercent, 100)}%` }}
                  />
                </div>
                <div className="w-16 text-right font-bold text-emerald-700">
                  {m.tatTargetPercent}%
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-slate-500 font-medium">เกณฑ์ผลตรวจด่วน (Stat):</p>
              <p className="text-slate-800 font-bold mt-1">ภายใน 30-45 นาที</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">ผ่านเกณฑ์ 99.4%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-slate-500 font-medium">เกณฑ์ผลตรวจปกติ (Routine):</p>
              <p className="text-slate-800 font-bold mt-1">ภายใน 60 นาที</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">ผ่านเกณฑ์ 98.9%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
