/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken
} from './services/auth';
import {
  fetchSpreadsheetMetadata,
  readSheetRange,
  appendSheetRow,
  deleteSheetRow,
  createLabTemplateSpreadsheet,
  extractSpreadsheetId
} from './services/sheetsService';
import { LabMonthlySummary, LabDailyRecord, QualityIndicator, NetworkUnitCost } from './types/lab';
import {
  INITIAL_MONTHLY_SUMMARIES,
  INITIAL_DAILY_RECORDS,
  QUALITY_INDICATORS,
  INITIAL_NETWORK_COSTS
} from './data/defaultData';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { LabCharts } from './components/LabCharts';
import { DataTable } from './components/DataTable';
import { NetworkCostDashboard } from './components/NetworkCostDashboard';
import { SheetConnectionModal } from './components/SheetConnectionModal';
import { AddRecordModal } from './components/AddRecordModal';
import { ReportModal } from './components/ReportModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const SAVED_SHEET_KEY = 'maekha_lab_spreadsheet_id';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Sheets data state
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem(SAVED_SHEET_KEY) || null;
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string | null>(null);
  const [sheetTabId, setSheetTabId] = useState<number>(0);

  // Lab records & statistics
  const [monthlySummaries, setMonthlySummaries] = useState<LabMonthlySummary[]>(
    INITIAL_MONTHLY_SUMMARIES
  );
  const [dailyRecords, setDailyRecords] = useState<LabDailyRecord[]>(INITIAL_DAILY_RECORDS);
  const [qualityIndicators] = useState<QualityIndicator[]>(QUALITY_INDICATORS);
  const [networkCosts, setNetworkCosts] = useState<NetworkUnitCost[]>(INITIAL_NETWORK_COSTS);

  const [selectedYear, setSelectedYear] = useState<number>(2569);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'table' | 'network-cost'>('overview');

  // Loading & status
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modals
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Destructive delete confirmation modal state
  const [recordToDelete, setRecordToDelete] = useState<LabDailyRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch data from connected Google Sheet
  const loadSheetData = useCallback(
    async (sheetId: string, currentToken: string) => {
      setIsSyncing(true);
      setErrorMessage(null);
      try {
        const metadata = await fetchSpreadsheetMetadata(sheetId, currentToken);
        setSpreadsheetTitle(metadata.title);

        // Find relevant sheet tab
        const dailyTab = metadata.sheets.find(
          (s) => s.title.includes('บันทึก') || s.title.includes('Daily') || s.index === 0
        ) || metadata.sheets[0];

        if (dailyTab) {
          setSheetTabId(dailyTab.sheetId);
          const rangeName = `${dailyTab.title}!A2:J1000`;
          const rows = await readSheetRange(sheetId, rangeName, currentToken);

          if (rows && rows.length > 0) {
            const parsedRecords: LabDailyRecord[] = rows
              .filter((row) => row.length >= 3 && row[0]?.trim())
              .map((row, idx) => ({
                id: `sheet-row-${idx + 2}`,
                rowIndex: idx + 2,
                date: row[0] || new Date().toISOString().slice(0, 10),
                category: (row[1] as any) || 'Hematology',
                testName: row[2] || 'การตรวจวิเคราะห์',
                patientCount: parseInt(row[3]) || 1,
                testCount: parseInt(row[4]) || 1,
                tatOnTimeCount: parseInt(row[5]) || 1,
                criticalCount: parseInt(row[6]) || 0,
                rejectedCount: parseInt(row[7]) || 0,
                operator: row[8] || 'นักเทคนิคการแพทย์',
                notes: row[9] || '',
              }));

            if (parsedRecords.length > 0) {
              setDailyRecords(parsedRecords);
            }
          }
        }

        // Also check if monthly summary sheet exists
        const monthlyTab = metadata.sheets.find(
          (s) => s.title.includes('สรุป') || s.title.includes('Monthly')
        );
        if (monthlyTab) {
          const monthRows = await readSheetRange(
            sheetId,
            `${monthlyTab.title}!A2:K50`,
            currentToken
          );
          if (monthRows && monthRows.length > 0) {
            const parsedSummaries: LabMonthlySummary[] = monthRows
              .filter((row) => row[0]?.trim())
              .map((row) => ({
                month: row[0] || 'ม.ค. 2569',
                year: parseInt(row[1]) || 2569,
                patientsCount: parseInt(row[2]) || 0,
                testsCount: parseInt(row[3]) || 0,
                tatTargetPercent: parseFloat(row[4]) || 99.0,
                specimenRejections: parseInt(row[5]) || 0,
                criticalValues: parseInt(row[6]) || 0,
                hematologyTests: parseInt(row[7]) || 0,
                chemistryTests: parseInt(row[8]) || 0,
                serologyTests: parseInt(row[9]) || 0,
                microscopyTests: parseInt(row[10]) || 0,
                screeningTests: 0,
              }));

            if (parsedSummaries.length > 0) {
              setMonthlySummaries(parsedSummaries);
            }
          }
        }

        // Check if network cost sheet exists
        const costTab = metadata.sheets.find(
          (s) => s.title.includes('ต้นทุน') || s.title.includes('Cost')
        );
        if (costTab) {
          const costRows = await readSheetRange(
            sheetId,
            `${costTab.title}!A2:N50`,
            currentToken
          );
          if (costRows && costRows.length > 0) {
            const parsedCosts: NetworkUnitCost[] = costRows
              .filter((row) => row.length >= 2 && row[1]?.trim())
              .map((row, idx) => ({
                id: `cost-row-${idx + 2}`,
                unitCode: row[0] || `PCU-${(idx + 1).toString().padStart(2, '0')}`,
                unitName: row[1] || 'หน่วยบริการปฐมภูมิ',
                zone: row[2] || 'โซนบริการ',
                patientCount: parseInt(row[3]) || 0,
                specimenCount: parseInt(row[4]) || 0,
                testCount: parseInt(row[5]) || 0,
                reagentCost: parseFloat(row[6]) || 0,
                consumablesCost: parseFloat(row[7]) || 0,
                logisticsCost: parseFloat(row[8]) || 0,
                totalCost: parseFloat(row[9]) || 0,
                reimbursement: parseFloat(row[10]) || 0,
                netBalance: parseFloat(row[11]) || 0,
                costPerTest: parseFloat(row[12]) || 0,
                notes: row[13] || '',
              }));

            if (parsedCosts.length > 0) {
              setNetworkCosts(parsedCosts);
            }
          }
        }

        setBannerNotice(`ซิงค์ข้อมูลจาก Google Sheets "${metadata.title}" เรียบร้อยแล้ว`);
        setTimeout(() => setBannerNotice(null), 4000);
      } catch (err: any) {
        console.error('Error loading sheet:', err);
        setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้');
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Auto load when user & spreadsheetId is set
  useEffect(() => {
    if (user && token && spreadsheetId) {
      loadSheetData(spreadsheetId, token);
    }
  }, [user, token, spreadsheetId, loadSheetData]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      setErrorMessage(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setBannerNotice(`เข้าสู่ระบบด้วยบัญชี Google สำเร็จ (${res.user.email})`);
        setTimeout(() => setBannerNotice(null), 4000);

        if (spreadsheetId) {
          loadSheetData(spreadsheetId, res.accessToken);
        } else {
          setIsSheetModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        'การเข้าสู่ระบบ Google ล้มเหลว โปรดตรวจสอบการอนุญาตการเข้าถึง Google Sheets'
      );
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setCachedAccessToken(null);
    setBannerNotice('ออกจากระบบเรียบร้อยแล้ว แสดงผลในโหมดตัวอย่าง');
    setTimeout(() => setBannerNotice(null), 3000);
  };

  // Connect user-specified sheet
  const handleConnectSpreadsheet = async (input: string) => {
    const cleanedId = extractSpreadsheetId(input);
    if (!cleanedId) return;

    const currentToken = token || (await getAccessToken());
    if (!currentToken) {
      setErrorMessage('กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนเชื่อมต่อ Google Sheet');
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      await loadSheetData(cleanedId, currentToken);
      setSpreadsheetId(cleanedId);
      localStorage.setItem(SAVED_SHEET_KEY, cleanedId);
      setIsSheetModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าถึงแผ่นงานนี้ได้');
    } finally {
      setIsSyncing(false);
    }
  };

  // Create auto-template sheet
  const handleCreateNewTemplate = async () => {
    const currentToken = token || (await getAccessToken());
    if (!currentToken) {
      setErrorMessage('กรุณาลงชื่อเข้าใช้ด้วย Google ก่อนสร้างแผ่นงาน');
      return;
    }

    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const created = await createLabTemplateSpreadsheet(currentToken);
      setSpreadsheetId(created.spreadsheetId);
      localStorage.setItem(SAVED_SHEET_KEY, created.spreadsheetId);

      // Seed initial sample rows into the newly created sheet so it starts populated
      for (const rec of INITIAL_DAILY_RECORDS.slice(0, 5)) {
        await appendSheetRow(
          created.spreadsheetId,
          'บันทึกงานรายวัน!A:J',
          [
            rec.date,
            rec.category,
            rec.testName,
            rec.patientCount,
            rec.testCount,
            rec.tatOnTimeCount,
            rec.criticalCount,
            rec.rejectedCount,
            rec.operator,
            rec.notes || '',
          ],
          currentToken
        );
      }

      // Seed 15 Network Primary Care Units Costs
      for (const unit of INITIAL_NETWORK_COSTS) {
        await appendSheetRow(
          created.spreadsheetId,
          'ต้นทุนแลปเครือข่าย15แห่ง!A:N',
          [
            unit.unitCode,
            unit.unitName,
            unit.zone,
            unit.patientCount,
            unit.specimenCount,
            unit.testCount,
            unit.reagentCost,
            unit.consumablesCost,
            unit.logisticsCost,
            unit.totalCost,
            unit.reimbursement,
            unit.netBalance,
            unit.costPerTest,
            unit.notes || '',
          ],
          currentToken
        );
      }

      await loadSheetData(created.spreadsheetId, currentToken);
      setIsSheetModalOpen(false);
      setBannerNotice('สร้าง Google Sheet แม่แบบศูนย์แพทย์แม่ข่าพร้อมแท็บต้นทุน 15 แห่งสำเร็จแล้ว!');
      setTimeout(() => setBannerNotice(null), 5000);
    } catch (err: any) {
      console.error('Error creating template:', err);
      setErrorMessage(err.message || 'ไม่สามารถสร้าง Google Sheet แม่แบบได้');
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch to demo data
  const handleUseDemoData = () => {
    setDailyRecords(INITIAL_DAILY_RECORDS);
    setMonthlySummaries(INITIAL_MONTHLY_SUMMARIES);
    setNetworkCosts(INITIAL_NETWORK_COSTS);
    setSpreadsheetId(null);
    setSpreadsheetTitle(null);
    localStorage.removeItem(SAVED_SHEET_KEY);
    setIsSheetModalOpen(false);
    setBannerNotice('สลับมาใช้ข้อมูลตัวอย่างมาตรฐานของศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า');
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Update a network unit's cost record
  const handleUpdateUnitCost = async (updatedUnit: NetworkUnitCost) => {
    setNetworkCosts((prev) =>
      prev.map((u) => (u.id === updatedUnit.id || u.unitCode === updatedUnit.unitCode ? updatedUnit : u))
    );
    setBannerNotice(`ปรับปรุงข้อมูลต้นทุนของ "${updatedUnit.unitName}" สำเร็จ`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Save new record (to Google Sheets if connected)
  const handleSaveRecord = async (newRecordData: Omit<LabDailyRecord, 'id'>) => {
    setIsSaving(true);
    try {
      const currentToken = token || (await getAccessToken());

      if (spreadsheetId && currentToken) {
        // Append row to Google Sheets
        await appendSheetRow(
          spreadsheetId,
          'บันทึกงานรายวัน!A:J',
          [
            newRecordData.date,
            newRecordData.category,
            newRecordData.testName,
            newRecordData.patientCount,
            newRecordData.testCount,
            newRecordData.tatOnTimeCount,
            newRecordData.criticalCount,
            newRecordData.rejectedCount,
            newRecordData.operator,
            newRecordData.notes || '',
          ],
          currentToken
        );
      }

      // Prepend to local state
      const newRec: LabDailyRecord = {
        id: `rec-local-${Date.now()}`,
        rowIndex: dailyRecords.length + 2,
        ...newRecordData,
      };
      setDailyRecords((prev) => [newRec, ...prev]);

      setIsAddRecordOpen(false);
      setBannerNotice(
        `บันทึกผลการตรวจ "${newRecordData.testName}" สำเร็จ ${
          spreadsheetId ? '(บันทึกลง Google Sheets แล้ว)' : ''
        }`
      );
      setTimeout(() => setBannerNotice(null), 4000);
    } catch (err: any) {
      console.error('Save record error:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger delete modal (per workspace skill mandatory confirmation)
  const handleRequestDelete = (record: LabDailyRecord) => {
    setRecordToDelete(record);
  };

  // Execute deletion after user confirms
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);

    try {
      const currentToken = token || (await getAccessToken());
      if (spreadsheetId && currentToken && recordToDelete.rowIndex) {
        // Zero-based row index in Sheets API
        const zeroBasedIndex = recordToDelete.rowIndex - 1;
        await deleteSheetRow(spreadsheetId, sheetTabId, zeroBasedIndex, currentToken);
      }

      // Remove from local state
      setDailyRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      setBannerNotice(`ลบรายการตรวจ "${recordToDelete.testName}" เรียบร้อยแล้ว`);
      setTimeout(() => setBannerNotice(null), 3000);
      setRecordToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('ไม่สามารถลบแถวข้อมูลใน Google Sheet ได้: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        user={user}
        spreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenAddRecord={() => setIsAddRecordOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onRefreshData={() => {
          if (spreadsheetId && token) loadSheetData(spreadsheetId, token);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Temporary Success/Notice Banner */}
      {bannerNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-xs transition-all animate-in slide-in-from-top-2 no-print">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If no sheet connected, show friendly helper alert */}
        {!spreadsheetId && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  กำลังแสดงผลข้อมูลตัวอย่างของศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  ท่านสามารถเชื่อมต่อ Google Sheets ส่วนตัว หรือให้ระบบสร้างชีตแม่แบบอัตโนมัติเพื่อใช้เป็นฐานข้อมูลจริงได้ทันที
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSheetModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer text-center"
            >
              ตั้งค่า / เชื่อมต่อ Google Sheet
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <StatsOverview
            monthlySummaries={monthlySummaries}
            qualityIndicators={qualityIndicators}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        )}

        {activeTab === 'charts' && (
          <LabCharts monthlySummaries={monthlySummaries} />
        )}

        {activeTab === 'table' && (
          <DataTable
            records={dailyRecords}
            onAddRecord={() => setIsAddRecordOpen(true)}
            onRequestDeleteRecord={handleRequestDelete}
            isSheetConnected={Boolean(spreadsheetId)}
          />
        )}

        {activeTab === 'network-cost' && (
          <NetworkCostDashboard
            networkCosts={networkCosts}
            onUpdateUnitCost={handleUpdateUnitCost}
            isSheetConnected={Boolean(spreadsheetId)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            งานห้องปฏิบัติการทางการแพทย์ ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า เทศบาลนครเชียงใหม่
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>ฐานข้อมูล: Google Sheets API v4</span>
            <span>•</span>
            <span>ระบบวิเคราะห์สถิติ & รายงานผล</span>
          </div>
        </div>
      </footer>

      {/* Google Sheets Connection Modal */}
      <SheetConnectionModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        currentSpreadsheetId={spreadsheetId}
        spreadsheetTitle={spreadsheetTitle}
        onConnectSpreadsheet={handleConnectSpreadsheet}
        onCreateNewTemplate={handleCreateNewTemplate}
        onUseDemoData={handleUseDemoData}
        isLoggedIn={Boolean(user)}
        isLoading={isSyncing}
        errorMessage={errorMessage}
      />

      {/* Add New Record Modal */}
      <AddRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onSaveRecord={handleSaveRecord}
        defaultOperator={user?.displayName || 'ทนพญ.จิรารัตน์ เครืออุดม'}
        isLoading={isSaving}
      />

      {/* Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        monthlySummaries={monthlySummaries}
        qualityIndicators={qualityIndicators}
        dailyRecords={dailyRecords}
        networkCosts={networkCosts}
        selectedYear={selectedYear}
        userName={user?.displayName || 'ทนพญ.จิรารัตน์ เครืออุดม'}
      />

      {/* User Confirmation Dialog for Destructive Delete (MANDATORY per workspace skill) */}
      <ConfirmationModal
        isOpen={Boolean(recordToDelete)}
        title="ยืนยันการลบรายการตรวจวิเคราะห์"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการตรวจ "${recordToDelete?.testName}" วันที่ ${recordToDelete?.date}? การดำเนินการนี้จะลบข้อมูลออกจากระบบและ Google Sheets (หากเชื่อมต่ออยู่) อย่างถาวรและไม่สามารถย้อนกลับได้`}
        details={
          recordToDelete
            ? `รายการ: ${recordToDelete.testName} | วันที่: ${recordToDelete.date} | ผู้รับบริการ: ${recordToDelete.patientCount} คน | ผู้ตรวจ: ${recordToDelete.operator}`
            : undefined
        }
        confirmText="ลบรายการนี้"
        cancelText="ยกเลิก"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
}
