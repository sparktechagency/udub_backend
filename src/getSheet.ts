/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Smartsheet from 'smartsheet';
import config from './app/config';

// make changes

const getSheet = async () => {
  const smartsheet = Smartsheet.createClient({
    accessToken: config.smartsheet_api_key as string,
  });
  try {
    const sheetsList = await smartsheet.sheets.listSheets();
    return {
      success: true,
      sheets: sheetsList.data.map((sheet: any) => ({
        id: sheet.id,
        name: sheet.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching sheets:', error);
  }
};

export default getSheet;
