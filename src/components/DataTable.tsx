import React, { useState, useMemo } from 'react';
import { LabDailyRecord } from '../types/lab';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Calendar,
  Layers
} from 'lucide-react';

interface DataTableProps {
  records: LabDailyRecord[];
  onAddRecord: () => void;
  onRequestDeleteRecord: (record: LabDailyRecord) => void;
  isSheetConnected: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  onAddRecord,
  onRequestDeleteRecord,
  isSheetConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'tests' | 'patients'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Search
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesCategory =
          selectedCategory === 'All' || rec.category === selectedCategory;
        const matchesSearch =
          rec.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.date.includes(searchTerm) ||
          (rec.notes && rec.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'tests') {
          comp = a.testCount - b.testCount;
        } else if (sortBy === 'patients') {
          comp = a.patientCount - b.patientCount;
        }
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [records, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'วันที่',
      'หมวดหมู่งาน',
      'รายการตรวจวิเคราะห์',
      'ผู้รับบริการ (คน)',
      'จำนวนการทดสอบ (Tests)',
      'รายงานทันเวลา TAT',
      'ค่าวิกฤต',
      'สิ่งส่งตรวจปฏิเสธ',
      'ผู้บันทึก',
      'หมายเหตุ',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.date}"`,
      `"${r.category}"`,
      `"${r.testName}"`,
      r.patientCount,
      r.testCount,
      r.tatOnTimeCount,
      r.criticalCount,
      r.rejectedCount,
      `"${r.operator}"`,
      `"${r.notes || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `lab_records_maekha_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Hematology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Clinical Chemistry':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Immunology/Serology':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Clinical Microscopy':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Screening/NCD':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Filter and Actions Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายการตรวจ, ผู้ตรวจ หรือวันที่..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="All">ทุกหมวดหมู่งาน</option>
              <option value="Hematology">โลหิตวิทยา (Hematology)</option>
              <option value="Clinical Chemistry">เคมีคลินิก (Clinical Chemistry)</option>
              <option value="Immunology/Serology">เซรุ่มวิทยา (Serology)</option>
              <option value="Clinical Microscopy">จุลทรรศนศาสตร์ (Microscopy)</option>
              <option value="Screening/NCD">คัดกรอง NCD & มะเร็งลำไส้ใหญ่</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="ดาวน์โหลดไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={onAddRecord}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกผลงาน</span>
          </button>
        </div>
      </div>

      {/* Table Information & Count */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          พบข้อมูลทั้งหมด <strong className="text-slate-800">{filteredRecords.length}</strong> รายการ
          {searchTerm && <span> (กรองจากคำว่า "{searchTerm}")</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]">เรียงตาม:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[11px] font-semibold bg-transparent border-0 text-slate-700 cursor-pointer outline-none"
          >
            <option value="date">วันที่</option>
            <option value="tests">จำนวน Tests</option>
            <option value="patients">ผู้รับบริการ</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            {sortOrder === 'asc' ? '↑ น้อยไปมาก' : '↓ มากไปน้อย'}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">วันที่</th>
              <th className="py-3 px-4">สาขางาน</th>
              <th className="py-3 px-4">รายการตรวจวิเคราะห์</th>
              <th className="py-3 px-4 text-center">ผู้รับบริการ</th>
              <th className="py-3 px-4 text-center">จำนวน Tests</th>
              <th className="py-3 px-4 text-center">TAT ตามเกณฑ์</th>
              <th className="py-3 px-4 text-center">ค่าวิกฤต</th>
              <th className="py-3 px-4 text-center">ปฏิเสธ</th>
              <th className="py-3 px-4">ผู้บันทึก</th>
              <th className="py-3 px-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, idx) => (
                <tr
                  key={r.id || idx}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                        r.category
                      )}`}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{r.testName}</div>
                    {r.notes && (
                      <div className="text-[11px] text-slate-400 mt-0.5 italic truncate max-w-xs">
                        {r.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {r.patientCount} คน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {r.testCount}
                  </td>
                  <td className="py-3 px-4 text-center font-medium">
                    <span className="text-emerald-700">{r.tatOnTimeCount}</span> / {r.testCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.criticalCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {r.criticalCount} ครั้ง
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.rejectedCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {r.rejectedCount} ครั้ง
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                    {r.operator}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onRequestDeleteRecord(r)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="ลบรายการนี้ (มีหน้าต่างยืนยันก่อนลบ)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-sm font-semibold">ไม่พบข้อมูลบันทึกตามเงื่อนไขที่ระบุ</p>
                  <p className="text-xs text-slate-500 mt-1">
                    ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "+ บันทึกผลงาน" ด้านบนเพื่อเพิ่มข้อมูลใหม่
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
