/**
 * Service to interact with Google Sheets API v4
 */

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    sheetId: number;
    title: string;
    index: number;
  }>;
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function fetchSpreadsheetMetadata(
  spreadsheetId: string,
  accessToken: string
): Promise<SheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = 'ไม่สามารถเชื่อมต่อกับ Google Sheet ได้';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  const data = await res.json();
  return {
    spreadsheetId,
    title: data.properties?.title || 'แผ่นงานห้องปฏิบัติการ',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index,
    })),
  };
}

export async function readSheetRange(
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = `ไม่สามารถอ่านข้อมูลช่วง ${range} ได้`;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.values || [];
}

export async function appendSheetRow(
  spreadsheetId: string,
  range: string,
  rowValues: (string | number)[],
  accessToken: string
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = 'ไม่สามารถบันทึกข้อมูลลงใน Google Sheet ได้';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep
    }
    throw new Error(message);
  }

  return await res.json();
}

export async function updateSheetRow(
  spreadsheetId: string,
  range: string,
  rowValues: (string | number)[],
  accessToken: string
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = 'ไม่สามารถอัปเดตข้อมูลใน Google Sheet ได้';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep
    }
    throw new Error(message);
  }

  return await res.json();
}

export async function deleteSheetRow(
  spreadsheetId: string,
  sheetId: number,
  rowIndexZeroBased: number,
  accessToken: string
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const body = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndexZeroBased,
            endIndex: rowIndexZeroBased + 1,
          },
        },
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = 'ไม่สามารถลบแถวข้อมูลใน Google Sheet ได้';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep
    }
    throw new Error(message);
  }

  return await res.json();
}

/**
 * Creates a brand new ready-to-use Google Spreadsheet with clinical laboratory schema
 */
export async function createLabTemplateSpreadsheet(
  accessToken: string,
  customTitle = 'สถิติห้องปฏิบัติการทางการแพทย์ - ศูนย์บริการสาธารณสุขและการแพทย์แม่ข่า'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const initialData = {
    properties: {
      title: customTitle,
      locale: 'th_TH',
      timeZone: 'Asia/Bangkok',
    },
    sheets: [
      {
        properties: {
          title: 'บันทึกงานรายวัน',
          sheetId: 0,
          gridProperties: {
            rowCount: 100,
            columnCount: 10,
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'วันที่' } },
                  { userEnteredValue: { stringValue: 'หมวดหมู่งาน' } },
                  { userEnteredValue: { stringValue: 'รายการตรวจวิเคราะห์' } },
                  { userEnteredValue: { stringValue: 'ผู้รับบริการ (คน)' } },
                  { userEnteredValue: { stringValue: 'จำนวนการทดสอบ (Tests)' } },
                  { userEnteredValue: { stringValue: 'รายงานผลตามเกณฑ์ TAT (ครั้ง)' } },
                  { userEnteredValue: { stringValue: 'รายงานค่าวิกฤต (ครั้ง)' } },
                  { userEnteredValue: { stringValue: 'ปฏิเสธสิ่งส่งตรวจ (ครั้ง)' } },
                  { userEnteredValue: { stringValue: 'ผู้บันทึก/นักเทคนิคการแพทย์' } },
                  { userEnteredValue: { stringValue: 'หมายเหตุ' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'สรุปรายเดือน',
          sheetId: 1,
          gridProperties: {
            rowCount: 50,
            columnCount: 11,
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'เดือน-ปี' } },
                  { userEnteredValue: { stringValue: 'พ.ศ.' } },
                  { userEnteredValue: { stringValue: 'ผู้รับบริการรวม (คน)' } },
                  { userEnteredValue: { stringValue: 'จำนวนการตรวจรวม (Tests)' } },
                  { userEnteredValue: { stringValue: '% TAT ตามเกณฑ์' } },
                  { userEnteredValue: { stringValue: 'สิ่งส่งตรวจปฏิเสธ (ครั้ง)' } },
                  { userEnteredValue: { stringValue: 'รายงานค่าวิกฤต (ครั้ง)' } },
                  { userEnteredValue: { stringValue: 'โลหิตวิทยา (Hematology)' } },
                  { userEnteredValue: { stringValue: 'เคมีคลินิก (Clinical Chemistry)' } },
                  { userEnteredValue: { stringValue: 'เซรุ่มวิทยา (Immunology/Serology)' } },
                  { userEnteredValue: { stringValue: 'จุลทรรศนศาสตร์ (Clinical Microscopy)' } },
                ],
              },
            ],
          },
        ],
      },
      {
        properties: {
          title: 'ต้นทุนแลปเครือข่าย15แห่ง',
          sheetId: 2,
          gridProperties: {
            rowCount: 50,
            columnCount: 14,
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'รหัสหน่วยบริการ' } },
                  { userEnteredValue: { stringValue: 'ชื่อหน่วยบริการปฐมภูมิ' } },
                  { userEnteredValue: { stringValue: 'เขต/โซน' } },
                  { userEnteredValue: { stringValue: 'ผู้รับบริการส่งตรวจ (คน)' } },
                  { userEnteredValue: { stringValue: 'จำนวนสิ่งส่งตรวจ (หลอด)' } },
                  { userEnteredValue: { stringValue: 'จำนวนการตรวจ (Tests)' } },
                  { userEnteredValue: { stringValue: 'ค่าน้ำยาตรวจวิเคราะห์ (บาท)' } },
                  { userEnteredValue: { stringValue: 'ค่าวัสดุวิทยาศาสตร์/หลอดเก็บ (บาท)' } },
                  { userEnteredValue: { stringValue: 'ค่าขนส่ง/บำรุงรักษา (บาท)' } },
                  { userEnteredValue: { stringValue: 'ต้นทุนรวมทั้งหมด (บาท)' } },
                  { userEnteredValue: { stringValue: 'ชดเชย สปสช./กองทุน (บาท)' } },
                  { userEnteredValue: { stringValue: 'ผลต่างสุทธิ (บาท)' } },
                  { userEnteredValue: { stringValue: 'ต้นทุนเฉลี่ยต่อ Test (บาท)' } },
                  { userEnteredValue: { stringValue: 'หมายเหตุ' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initialData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = 'ไม่สามารถสร้าง Google Sheet ใหม่ได้';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || message;
    } catch {
      // keep
    }
    throw new Error(message);
  }

  const created = await res.json();
  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
  };
}
