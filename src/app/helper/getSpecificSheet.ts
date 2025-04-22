/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Smartsheet from 'smartsheet';
import config from '../config';

const getSpecificSheet = async (sheetId: string) => {
  try {
    if (!process.env.SMARTSHEET_API_KEY) {
      throw new Error('Missing SMARTSHEET_API_KEY in environment variables');
    }

    const smartsheet = Smartsheet.createClient({
      accessToken: config.smartsheet_api_key,
    });

    // Fetch the sheet by ID
    const sheet = await smartsheet.sheets.getSheet({ id: sheetId });
    return {
      success: true,
      sheet: {
        id: sheet.id,
        name: sheet.name,
        columns: sheet.columns.map((col: any) => ({
          id: col.id,
          title: col.title,
          type: col.type,
        })),
        rows: sheet.rows.map((row: any) => ({
          id: row.id,
          cells: row.cells.map((cell: any) => cell.value), // Extract cell values
        })),
      },
    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch sheet', error };
  }
};

export default getSpecificSheet;
