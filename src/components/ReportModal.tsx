import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { LabMonthlySummary, QualityIndicator, LabDailyRecord, NetworkUnitCost } from '../types/lab';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySummaries: LabMonthlySummary[];
  qualityIndicators: QualityIndicator[];
  dailyRecords: LabDailyRecord[];
  networkCosts?: NetworkUnitCost[];
  selectedYear: number;
  userName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  monthlySummaries,
  qualityIndicators,
  dailyRecords,
  networkCosts = [],
  selectedYear,
  userName = 'ทนพญ.จิรารัตน์ เครืออุดม',
}) => {
  if (!isOpen) return null;

  const totalPatients = monthlySummaries.reduce((sum, item) => sum + item.patientsCount, 0);
  const totalTests = monthlySummaries.reduce((sum, item) => sum + item.testsCount, 0);
  const totalCritical = monthlySummaries.reduce((sum, item) => sum + item.criticalValues, 0);
  const totalRejections = monthlySummaries.reduce((sum, item) => sum + item.specimenRejections, 0);
  const avgTat =
    monthlySummaries.length > 0
      ? (
          monthlySummaries.reduce((sum, item) => sum + item.tatTargetPercent, 0) /
          monthlySummaries.length
        ).toFixed(1)
      : '99.0';

  const totalChemistry = monthlySummaries.reduce((sum, item) => sum + item.chemistryTests, 0);
  const totalHematology = monthlySummaries.reduce((sum, item) => sum + item.hematologyTests, 0);
  const totalSerology = monthlySummaries.reduce((sum, item) => sum + item.serologyTests, 0);
  const totalMicroscopy = monthlySummaries.reduce((sum, item) => sum + item.microscopyTests, 0);
  const totalScreening = monthlySummaries.reduce((sum, item) => sum + item.screeningTests, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Controls (No print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>แบบพิมพ์รายงานผลการดำเนินงานห้องปฏิบัติการ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 styling) */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white space-y-6">
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg mb-2 shadow-xs">
              มข
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
            </h2>
            <h3 className="text-base font-semibold text-slate-700">
              สรุปรายงานผลการดำเนินงานงานห้องปฏิบัติการทางการแพทย์ ประจำปีงบประมาณ {selectedYear}
            </h3>
            <p className="text-xs text-slate-500">
              กลุ่มงานบริการทางการแพทย์และสาธารณสุข เทศบาลนครเชียงใหม่
            </p>
          </div>

          {/* Report Metadata */}
          <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-3">
            <div>
              <span className="font-semibold">หน่วยงาน:</span> งานห้องปฏิบัติการทางการแพทย์ (Medical Laboratory)
            </div>
            <div>
              <span className="font-semibold">วันที่พิมพ์รายงาน:</span>{' '}
              {new Date().toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Key Executive Summary */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">1. สรุปภาพรวมปริมาณงานและตัวชี้วัดหลัก</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-medium">ผู้รับบริการรวม</p>
                <p className="text-lg font-bold text-emerald-800 mt-0.5">{totalPatients.toLocaleString()} คน</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-medium">ตรวจวิเคราะห์รวม</p>
                <p className="text-lg font-bold text-teal-800 mt-0.5">{totalTests.toLocaleString()} รายการ</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-medium">รายงานผลทันเวลา (TAT)</p>
                <p className="text-lg font-bold text-cyan-800 mt-0.5">{avgTat}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 font-medium">รายงานค่าวิกฤตทันเวลา</p>
                <p className="text-lg font-bold text-indigo-800 mt-0.5">100% ({totalCritical} ราย)</p>
              </div>
            </div>
          </div>

          {/* Breakdown by Discipline */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">2. ปริมาณการตรวจแยกตามสาขาทางห้องปฏิบัติการ</h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">สาขาการตรวจวิเคราะห์</th>
                  <th className="p-2 text-right border-r border-slate-300">จำนวนการตรวจ (Tests)</th>
                  <th className="p-2 text-right border-r border-slate-300">คิดเป็นร้อยละ</th>
                  <th className="p-2">รายการตรวจเด่น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium border-r border-slate-200">1. เคมีคลินิก (Clinical Chemistry)</td>
                  <td className="p-2 text-right font-semibold border-r border-slate-200">{totalChemistry.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-200">{((totalChemistry / (totalTests || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-slate-600">FBS, HbA1c, Lipid Profile, Renal Function, Liver Function</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium border-r border-slate-200">2. โลหิตวิทยา (Hematology)</td>
                  <td className="p-2 text-right font-semibold border-r border-slate-200">{totalHematology.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-200">{((totalHematology / (totalTests || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-slate-600">CBC (Complete Blood Count), Blood Smear</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium border-r border-slate-200">3. จุลทรรศนศาสตร์คลินิก (Microscopy)</td>
                  <td className="p-2 text-right font-semibold border-r border-slate-200">{totalMicroscopy.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-200">{((totalMicroscopy / (totalTests || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-slate-600">Urinalysis (UA), Stool Exam</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium border-r border-slate-200">4. ภูมิคุ้มกันวิทยา (Immunology/Serology)</td>
                  <td className="p-2 text-right font-semibold border-r border-slate-200">{totalSerology.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-200">{((totalSerology / (totalTests || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-slate-600">Anti-HIV, VDRL/Syphilis, HBsAg, Pregnancy Test</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium border-r border-slate-200">5. คัดกรองสุขภาพเชิงรุกและชุมชน</td>
                  <td className="p-2 text-right font-semibold border-r border-slate-200">{totalScreening.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-200">{((totalScreening / (totalTests || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-slate-600">FOBT คัดกรองมะเร็งลำไส้ใหญ่, ตรวจคัดกรองเบาหวานชุมชนคลองแม่ข่า</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="p-2 border-r border-slate-300">รวมทั้งหมด</td>
                  <td className="p-2 text-right border-r border-slate-300 text-emerald-800">{totalTests.toLocaleString()}</td>
                  <td className="p-2 text-right border-r border-slate-300">100.0%</td>
                  <td className="p-2">เฉลี่ย {(totalTests / (totalPatients || 1)).toFixed(1)} การตรวจ/คน</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quality & Safety Indicators */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">3. สรุปผลการประเมินคุณภาพมาตรฐาน</h4>
            <div className="space-y-1.5 text-xs">
              {qualityIndicators.map((qi, idx) => (
                <div key={idx} className="flex justify-between py-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{qi.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{qi.current}</span>
                    <span className="text-slate-400 ml-2">(เกณฑ์ {qi.target})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Network Unit Costs */}
          {networkCosts.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                4. สรุปต้นทุนค่าใช้จ่ายห้องปฏิบัติการเครือข่ายหน่วยบริการปฐมภูมิ 15 แห่ง
              </h4>
              <table className="w-full text-left text-[11px] border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r border-slate-300">รหัส</th>
                    <th className="p-1.5 border-r border-slate-300">หน่วยบริการปฐมภูมิ</th>
                    <th className="p-1.5 text-center border-r border-slate-300">ผู้รับบริการ (คน)</th>
                    <th className="p-1.5 text-center border-r border-slate-300">Tests</th>
                    <th className="p-1.5 text-right border-r border-slate-300">ค่าน้ำยา (บาท)</th>
                    <th className="p-1.5 text-right border-r border-slate-300">ต้นทุนรวม (บาท)</th>
                    <th className="p-1.5 text-right border-r border-slate-300">ชดเชย สปสช.</th>
                    <th className="p-1.5 text-center">เฉลี่ย/Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {networkCosts.slice(0, 15).map((u) => (
                    <tr key={u.id}>
                      <td className="p-1.5 font-mono border-r border-slate-200">{u.unitCode}</td>
                      <td className="p-1.5 font-medium border-r border-slate-200">{u.unitName}</td>
                      <td className="p-1.5 text-center border-r border-slate-200">{u.patientCount.toLocaleString()}</td>
                      <td className="p-1.5 text-center border-r border-slate-200">{u.testCount.toLocaleString()}</td>
                      <td className="p-1.5 text-right border-r border-slate-200">{u.reagentCost.toLocaleString()}</td>
                      <td className="p-1.5 text-right font-semibold border-r border-slate-200">{u.totalCost.toLocaleString()}</td>
                      <td className="p-1.5 text-right text-emerald-800 border-r border-slate-200">{u.reimbursement.toLocaleString()}</td>
                      <td className="p-1.5 text-center">฿{u.costPerTest}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td className="p-1.5 border-r border-slate-300" colSpan={2}>รวม 15 หน่วยบริการปฐมภูมิ</td>
                    <td className="p-1.5 text-center border-r border-slate-300">
                      {networkCosts.reduce((s, u) => s + u.patientCount, 0).toLocaleString()}
                    </td>
                    <td className="p-1.5 text-center border-r border-slate-300">
                      {networkCosts.reduce((s, u) => s + u.testCount, 0).toLocaleString()}
                    </td>
                    <td className="p-1.5 text-right border-r border-slate-300">
                      ฿{networkCosts.reduce((s, u) => s + u.reagentCost, 0).toLocaleString()}
                    </td>
                    <td className="p-1.5 text-right text-amber-900 border-r border-slate-300">
                      ฿{networkCosts.reduce((s, u) => s + u.totalCost, 0).toLocaleString()}
                    </td>
                    <td className="p-1.5 text-right text-emerald-900 border-r border-slate-300">
                      ฿{networkCosts.reduce((s, u) => s + u.reimbursement, 0).toLocaleString()}
                    </td>
                    <td className="p-1.5 text-center">
                      ฿{(
                        networkCosts.reduce((s, u) => s + u.totalCost, 0) /
                        (networkCosts.reduce((s, u) => s + u.testCount, 0) || 1)
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-8">
              <p>ลงชื่อ........................................................ ผู้รายงาน</p>
              <div>
                <p className="font-bold">({userName})</p>
                <p className="text-slate-500">นักเทคนิคการแพทย์ งานห้องปฏิบัติการ</p>
              </div>
            </div>
            <div className="space-y-8">
              <p>ลงชื่อ........................................................ ผู้รับรอง</p>
              <div>
                <p className="font-bold">(........................................................)</p>
                <p className="text-slate-500">หัวหน้ากลุ่มงานบริการทางการแพทย์และสาธารณสุข</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
