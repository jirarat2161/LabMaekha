import React, { useState, useMemo } from 'react';
import { NetworkUnitCost } from '../types/lab';
import {
  Coins,
  Building2,
  TrendingUp,
  Download,
  Filter,
  Search,
  PieChart,
  Truck,
  FlaskConical,
  BadgeCheck,
  Edit3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NetworkCostDashboardProps {
  networkCosts: NetworkUnitCost[];
  onUpdateUnitCost: (unit: NetworkUnitCost) => Promise<void>;
  isSheetConnected: boolean;
}

export const NetworkCostDashboard: React.FC<NetworkCostDashboardProps> = ({
  networkCosts,
  onUpdateUnitCost,
  isSheetConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [sortBy, setSortBy] = useState<'totalCost' | 'testCount' | 'patientCount' | 'costPerTest'>('totalCost');
  const [editingUnit, setEditingUnit] = useState<NetworkUnitCost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Aggregated totals
  const totalCost = useMemo(() => networkCosts.reduce((sum, u) => sum + u.totalCost, 0), [networkCosts]);
  const totalReagentCost = useMemo(() => networkCosts.reduce((sum, u) => sum + u.reagentCost, 0), [networkCosts]);
  const totalConsumablesCost = useMemo(() => networkCosts.reduce((sum, u) => sum + u.consumablesCost, 0), [networkCosts]);
  const totalLogisticsCost = useMemo(() => networkCosts.reduce((sum, u) => sum + u.logisticsCost, 0), [networkCosts]);
  const totalReimbursement = useMemo(() => networkCosts.reduce((sum, u) => sum + u.reimbursement, 0), [networkCosts]);
  const totalNetBalance = useMemo(() => networkCosts.reduce((sum, u) => sum + u.netBalance, 0), [networkCosts]);
  const totalTests = useMemo(() => networkCosts.reduce((sum, u) => sum + u.testCount, 0), [networkCosts]);
  const totalPatients = useMemo(() => networkCosts.reduce((sum, u) => sum + u.patientCount, 0), [networkCosts]);
  const avgCostPerTest = totalTests > 0 ? (totalCost / totalTests).toFixed(2) : '0.00';

  // Extract unique zones
  const zones = useMemo(() => {
    const set = new Set(networkCosts.map((u) => u.zone));
    return ['All', ...Array.from(set)];
  }, [networkCosts]);

  // Filter & Sort
  const filteredUnits = useMemo(() => {
    return networkCosts
      .filter((u) => {
        const matchesZone = selectedZone === 'All' || u.zone === selectedZone;
        const matchesSearch =
          u.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.zone.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesZone && matchesSearch;
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [networkCosts, searchTerm, selectedZone, sortBy]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredUnits.length === 0) return;
    const headers = [
      'รหัสหน่วยบริการ',
      'ชื่อหน่วยบริการปฐมภูมิ',
      'เขต/โซน',
      'ผู้รับบริการ (คน)',
      'สิ่งส่งตรวจ (หลอด)',
      'การตรวจวิเคราะห์ (Tests)',
      'ค่าน้ำยา (บาท)',
      'ค่าวัสดุหลอดเก็บ (บาท)',
      'ค่าขนส่ง/บำรุงรักษา (บาท)',
      'ต้นทุนรวม (บาท)',
      'ชดเชย สปสช. (บาท)',
      'ผลต่างสุทธิ (บาท)',
      'ต้นทุนเฉลี่ยต่อ Test (บาท)',
      'หมายเหตุ',
    ];

    const rows = filteredUnits.map((u) => [
      `"${u.unitCode}"`,
      `"${u.unitName}"`,
      `"${u.zone}"`,
      u.patientCount,
      u.specimenCount,
      u.testCount,
      u.reagentCost,
      u.consumablesCost,
      u.logisticsCost,
      u.totalCost,
      u.reimbursement,
      u.netBalance,
      u.costPerTest,
      `"${u.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pcu_network_lab_costs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSaving(true);
    try {
      const calcTotal = editingUnit.reagentCost + editingUnit.consumablesCost + editingUnit.logisticsCost;
      const calcBalance = editingUnit.reimbursement - calcTotal;
      const calcAvg = editingUnit.testCount > 0 ? Number((calcTotal / editingUnit.testCount).toFixed(2)) : 0;

      const updated: NetworkUnitCost = {
        ...editingUnit,
        totalCost: calcTotal,
        netBalance: calcBalance,
        costPerTest: calcAvg,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };

      await onUpdateUnitCost(updated);
      setEditingUnit(null);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              เครือข่ายหน่วยบริการปฐมภูมิ 15 แห่ง
            </span>
            <span className="text-xs text-slate-400 font-medium">| แม่ข่าย: ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            รายงานการวิเคราะห์ต้นทุนและค่าใช้จ่ายห้องปฏิบัติการ (Lab Cost Accounting)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปค่าใช้จ่ายค่าน้ำยาตรวจวิเคราะห์, ค่าวัสดุเก็บสิ่งส่งตรวจ, ค่าระบบขนส่งตัวอย่าง และการเบิกชดเชยค่าบริการ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ส่งออกตารางต้นทุน (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 Main Cost Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ต้นทุนค่าใช้จ่ายรวม 15 แห่ง
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ฿{totalCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              เฉลี่ย {avgCostPerTest} บาท / การตรวจ (Tests)
            </p>
          </div>
        </div>

        {/* Reagent Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ค่าน้ำยา & สารเคมีตรวจวิเคราะห์
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-800 tracking-tight">
              ฿{totalReagentCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-teal-700 mt-1 font-medium">
              คิดเป็น {((totalReagentCost / (totalCost || 1)) * 100).toFixed(1)}% ของต้นทุนทั้งหมด
            </p>
          </div>
        </div>

        {/* Consumables & Logistics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ค่าวัสดุ & ขนส่งสิ่งส่งตรวจ
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-800 tracking-tight">
              ฿{(totalConsumablesCost + totalLogisticsCost).toLocaleString()}
            </div>
            <p className="text-[11px] text-cyan-700 mt-1 font-medium">
              หลอดเก็บเลือด ฿{totalConsumablesCost.toLocaleString()} | ขนส่ง ฿{totalLogisticsCost.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reimbursement & Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ชดเชย สปสช. / กองทุนสุขภาพ
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <BadgeCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              ฿{totalReimbursement.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ส่วนต่างบวกสุทธิ ฿{totalNetBalance.toLocaleString()} บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Comparison: Top 15 Units Cost Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>เปรียบเทียบต้นทุนค่าใช้จ่ายแลปของหน่วยบริการปฐมภูมิในเครือข่าย 15 แห่ง</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงสัดส่วนค่าน้ำยา (สีเขียวหัวเป็ด) ค่าวัสดุหลอดตรวจ (สีฟ้า) และค่าขนส่ง (สีส้ม)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-teal-600 rounded-xs"></span>
              <span className="text-slate-600">ค่าน้ำยา</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-500 rounded-xs"></span>
              <span className="text-slate-600">ค่าวัสดุ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-xs"></span>
              <span className="text-slate-600">ค่าขนส่ง/บำรุง</span>
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart for 15 Units */}
        <div className="space-y-2.5 pt-2">
          {networkCosts.map((unit) => {
            const maxUnitCost = 220000;
            const reagentPct = (unit.reagentCost / maxUnitCost) * 100;
            const consumablesPct = (unit.consumablesCost / maxUnitCost) * 100;
            const logisticsPct = (unit.logisticsCost / maxUnitCost) * 100;

            return (
              <div key={unit.id} className="group hover:bg-slate-50/80 p-2 rounded-xl transition-colors">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {unit.unitCode}
                    </span>
                    <span className="font-semibold text-slate-800">{unit.unitName}</span>
                    <span className="text-[10px] text-slate-400 hidden md:inline">({unit.zone})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      {unit.testCount.toLocaleString()} tests
                    </span>
                    <span className="font-bold text-slate-900 min-w-20 text-right">
                      ฿{unit.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${reagentPct}%` }}
                    className="h-full bg-teal-600 transition-all duration-300"
                    title={`ค่าน้ำยา: ฿${unit.reagentCost.toLocaleString()}`}
                  />
                  <div
                    style={{ width: `${consumablesPct}%` }}
                    className="h-full bg-cyan-500 transition-all duration-300"
                    title={`ค่าวัสดุ: ฿${unit.consumablesCost.toLocaleString()}`}
                  />
                  <div
                    style={{ width: `${logisticsPct}%` }}
                    className="h-full bg-amber-500 transition-all duration-300"
                    title={`ค่าขนส่ง: ฿${unit.logisticsCost.toLocaleString()}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อหน่วยบริการ, รหัส หรือโซน..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {zones.map((z, idx) => (
                  <option key={idx} value={z}>
                    {z === 'All' ? 'ทุกโซนพื้นที่' : z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">จัดเรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="totalCost">ต้นทุนรวมสูงสุด</option>
              <option value="testCount">จำนวน Tests มากสุด</option>
              <option value="patientCount">ผู้รับบริการมากสุด</option>
              <option value="costPerTest">ต้นทุนเฉลี่ย/Test</option>
            </select>
          </div>
        </div>

        {/* Units Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">รหัส & ชื่อหน่วยบริการ</th>
                <th className="py-3 px-4">เขต/โซน</th>
                <th className="py-3 px-4 text-center">ผู้รับบริการ</th>
                <th className="py-3 px-4 text-center">จำนวน Tests</th>
                <th className="py-3 px-4 text-right">ค่าน้ำยา (บาท)</th>
                <th className="py-3 px-4 text-right">ค่าวัสดุ+ขนส่ง</th>
                <th className="py-3 px-4 text-right">ต้นทุนรวม (บาท)</th>
                <th className="py-3 px-4 text-right">ชดเชย สปสช.</th>
                <th className="py-3 px-4 text-center">เฉลี่ย/Test</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {u.unitCode}
                      </span>
                      <span className="font-semibold text-slate-900">{u.unitName}</span>
                    </div>
                    {u.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{u.notes}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">{u.zone}</td>
                  <td className="py-3 px-4 text-center font-medium text-slate-800">
                    {u.patientCount.toLocaleString()} คน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-teal-700">
                    {u.testCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">฿{u.reagentCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    ฿{(u.consumablesCost + u.logisticsCost).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ฿{u.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    ฿{u.reimbursement.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    ฿{u.costPerTest}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setEditingUnit(u)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="แก้ไขตัวเลขต้นทุนและงบประมาณ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/90 font-bold text-slate-900 text-xs border-t-2 border-slate-300">
              <tr>
                <td className="py-3 px-4" colSpan={2}>
                  รวมทั้ง 15 หน่วยบริการปฐมภูมิ
                </td>
                <td className="py-3 px-4 text-center">{totalPatients.toLocaleString()} คน</td>
                <td className="py-3 px-4 text-center text-teal-800">{totalTests.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">฿{totalReagentCost.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">฿{(totalConsumablesCost + totalLogisticsCost).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-amber-900">฿{totalCost.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-800">฿{totalReimbursement.toLocaleString()}</td>
                <td className="py-3 px-4 text-center">฿{avgCostPerTest}</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Edit Cost Modal */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-base">ปรับปรุงข้อมูลต้นทุนค่าใช้จ่าย</h3>
                <p className="text-xs text-slate-500">{editingUnit.unitName} ({editingUnit.unitCode})</p>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผู้รับบริการ (คน):</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUnit.patientCount}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, patientCount: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนการตรวจ (Tests):</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUnit.testCount}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, testCount: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ค่าน้ำยาตรวจวิเคราะห์ (บาท):</label>
                <input
                  type="number"
                  min="0"
                  value={editingUnit.reagentCost}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, reagentCost: Number(e.target.value) || 0 })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ค่าวัสดุ/หลอดเก็บตัวอย่าง (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUnit.consumablesCost}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, consumablesCost: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ค่าขนส่งและบำรุงรักษา (บาท):</label>
                  <input
                    type="number"
                    min="0"
                    value={editingUnit.logisticsCost}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, logisticsCost: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชดเชย สปสช. / กองทุน (บาท):</label>
                <input
                  type="number"
                  min="0"
                  value={editingUnit.reimbursement}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, reimbursement: Number(e.target.value) || 0 })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ:</label>
                <input
                  type="text"
                  value={editingUnit.notes || ''}
                  onChange={(e) => setEditingUnit({ ...editingUnit, notes: e.target.value })}
                  placeholder="เช่น รอบส่งสิ่งส่งตรวจ, คลินิก NCD ฯลฯ"
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
