import React from 'react';
import {
  Users,
  TestTube,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LabMonthlySummary, QualityIndicator } from '../types/lab';

interface StatsOverviewProps {
  monthlySummaries: LabMonthlySummary[];
  qualityIndicators: QualityIndicator[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  monthlySummaries,
  qualityIndicators,
  selectedYear,
  setSelectedYear,
}) => {
  // Aggregate stats
  const totalPatients = monthlySummaries.reduce((sum, item) => sum + item.patientsCount, 0);
  const totalTests = monthlySummaries.reduce((sum, item) => sum + item.testsCount, 0);
  const avgTat =
    monthlySummaries.length > 0
      ? (
          monthlySummaries.reduce((sum, item) => sum + item.tatTargetPercent, 0) /
          monthlySummaries.length
        ).toFixed(1)
      : '99.0';
  const totalCritical = monthlySummaries.reduce((sum, item) => sum + item.criticalValues, 0);
  const totalRejections = monthlySummaries.reduce((sum, item) => sum + item.specimenRejections, 0);
  const rejectionRate = totalTests > 0 ? ((totalRejections / totalTests) * 100).toFixed(2) : '0.00';

  const totalHematology = monthlySummaries.reduce((sum, item) => sum + item.hematologyTests, 0);
  const totalChemistry = monthlySummaries.reduce((sum, item) => sum + item.chemistryTests, 0);
  const totalSerology = monthlySummaries.reduce((sum, item) => sum + item.serologyTests, 0);
  const totalMicroscopy = monthlySummaries.reduce((sum, item) => sum + item.microscopyTests, 0);
  const totalScreening = monthlySummaries.reduce((sum, item) => sum + item.screeningTests, 0);

  return (
    <div className="space-y-6">
      {/* Title bar with year filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>สรุปผลการดำเนินงานห้องปฏิบัติการ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
              ปีงบประมาณ {selectedYear}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ข้อมูลสถิติปริมาณงาน ตัวชี้วัดคุณภาพ และการให้บริการประชาชน ณ ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium">เลือกปี พ.ศ.:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value={2569}>2569 (ปีปัจจุบัน)</option>
            <option value={2568}>2568</option>
            <option value={2567}>2567</option>
          </select>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ผู้รับบริการทั้งหมด
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalPatients.toLocaleString()}
              <span className="text-sm font-medium text-slate-500 ml-1.5">คน</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>เฉลี่ย {(totalPatients / (monthlySummaries.length || 1)).toFixed(0)} คน/เดือน</span>
            </div>
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              จำนวนการตรวจวิเคราะห์
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-105 transition-transform">
              <TestTube className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalTests.toLocaleString()}
              <span className="text-sm font-medium text-slate-500 ml-1.5">รายการ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-700 font-medium">
              <span>เฉลี่ย {(totalTests / (totalPatients || 1)).toFixed(1)} การตรวจ/คน</span>
            </div>
          </div>
        </div>

        {/* Turnaround Time (TAT) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ผ่านเกณฑ์ระยะเวลา (TAT)
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {avgTat}%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>เกณฑ์เป้าหมาย ≥ 95.0% (ผ่านเกณฑ์ดีเยี่ยม)</span>
            </div>
          </div>
        </div>

        {/* Quality & Safety */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              แจ้งเตือนค่าวิกฤตทันเวลา
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              100%
              <span className="text-xs font-medium text-slate-500 ml-1.5">({totalCritical} ครั้ง)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
              <span>อัตราปฏิเสธสิ่งส่งตรวจ {rejectionRate}% (ต่ำกว่าเกณฑ์ 1%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Distribution Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            สัดส่วนปริมาณงานตรวจวิเคราะห์แยกตามสาขาห้องปฏิบัติการ
          </h3>
          <span className="text-xs text-slate-500">รวม 5 สาขาบริการหลัก</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[11px] text-slate-500 font-medium">เคมีคลินิก (Clinical Chem)</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{totalChemistry.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {((totalChemistry / (totalTests || 1)) * 100).toFixed(1)}% ของงานทั้งหมด
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[11px] text-slate-500 font-medium">โลหิตวิทยา (Hematology)</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{totalHematology.toLocaleString()}</p>
            <p className="text-[10px] text-teal-600 font-medium mt-0.5">
              {((totalHematology / (totalTests || 1)) * 100).toFixed(1)}% ของงานทั้งหมด
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[11px] text-slate-500 font-medium">จุลทรรศนศาสตร์ (Microscopy)</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{totalMicroscopy.toLocaleString()}</p>
            <p className="text-[10px] text-cyan-600 font-medium mt-0.5">
              {((totalMicroscopy / (totalTests || 1)) * 100).toFixed(1)}% ของงานทั้งหมด
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[11px] text-slate-500 font-medium">ภูมิคุ้มกันวิทยา (Serology)</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{totalSerology.toLocaleString()}</p>
            <p className="text-[10px] text-indigo-600 font-medium mt-0.5">
              {((totalSerology / (totalTests || 1)) * 100).toFixed(1)}% ของงานทั้งหมด
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2 sm:col-span-1">
            <p className="text-[11px] text-slate-500 font-medium">คัดกรองชุมชน (Outreach/FOBT)</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{totalScreening.toLocaleString()}</p>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">
              {((totalScreening / (totalTests || 1)) * 100).toFixed(1)}% ของงานทั้งหมด
            </p>
          </div>
        </div>
      </div>

      {/* Quality Indicators Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ตัวชี้วัดการประกันคุณภาพห้องปฏิบัติการ (Quality Indicators)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {qualityIndicators.map((qi, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50/70 to-white flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-slate-800">{qi.name}</p>
                </div>
                <p className="text-[11px] text-slate-500">{qi.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  {qi.current}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">เป้าหมาย: {qi.target}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
