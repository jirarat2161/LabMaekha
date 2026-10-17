export interface LabMonthlySummary {
  month: string; // e.g. "ม.ค. 2569", "ก.พ. 2569"
  year: number; // พ.ศ. เช่น 2569
  patientsCount: number;
  testsCount: number;
  tatTargetPercent: number; // เช่น 98.5%
  specimenRejections: number;
  criticalValues: number;
  hematologyTests: number;
  chemistryTests: number;
  serologyTests: number;
  microscopyTests: number;
  screeningTests: number;
}

export interface LabDailyRecord {
  id: string;
  rowIndex?: number;
  date: string; // YYYY-MM-DD
  category: 'Hematology' | 'Clinical Chemistry' | 'Immunology/Serology' | 'Clinical Microscopy' | 'Screening/NCD';
  testName: string;
  patientCount: number;
  testCount: number;
  tatOnTimeCount: number;
  criticalCount: number;
  rejectedCount: number;
  operator: string;
  notes?: string;
}

export interface QualityIndicator {
  name: string;
  target: string;
  current: string;
  status: 'excellent' | 'good' | 'warning' | 'alert';
  description: string;
}

export interface NetworkUnitCost {
  id: string;
  unitCode: string;
  unitName: string; // ชื่อหน่วยบริการปฐมภูมิ
  zone: string; // เขตรับผิดชอบ
  patientCount: number; // ผู้รับบริการส่งตรวจ (คน)
  specimenCount: number; // สิ่งส่งตรวจ (หลอด/ตัวอย่าง)
  testCount: number; // จำนวนการทดสอบ (Tests)
  reagentCost: number; // ค่าน้ำยาตรวจวิเคราะห์ (บาท)
  consumablesCost: number; // ค่าวัสดุวิทยาศาสตร์/หลอดเก็บเลือด (บาท)
  logisticsCost: number; // ค่าขนส่งสิ่งส่งตรวจและบำรุงรักษา (บาท)
  totalCost: number; // ต้นทุนรวมทั้งหมด (บาท)
  reimbursement: number; // ค่าชดเชย สปสช./กองทุนสุขภาพ (บาท)
  netBalance: number; // ผลต่างรายรับ-ต้นทุน (บาท)
  costPerTest: number; // ต้นทุนเฉลี่ยต่อ 1 การทดสอบ (บาท)
  lastUpdated?: string;
  notes?: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
  range: string;
  title?: string;
}
