/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Smartsheet from 'smartsheet';
import config from '../config';

const getSpecificSheet = async (sheetId: string) => {
  console.log('oley', sheetId);
  try {
    if (!process.env.SMARTSHEET_API_KEY) {
      throw new Error('Missing SMARTSHEET_API_KEY in environment variables');
    }

    const smartsheet = Smartsheet.createClient({
      accessToken: config.smartsheet_api_key,
    });

    // Fetch the sheet by ID
    const sheet = await smartsheet.sheets.getSheet({ id: sheetId });
    // console.log('sheet', sheet);
    // const sheedDAta = {
    //   success: true,
    //   sheet: {
    //     id: sheet.id,
    //     name: sheet.name,
    //     columns: sheet.columns.map((col: any) => ({
    //       id: col.id,
    //       title: col.title,
    //       type: col.type,
    //     })),
    //     rows: sheet.rows.map((row: any) => ({
    //       id: row.id,
    //       cells: row.cells.map((cell: any) => cell.value), // Extract cell values
    //     })),
    //   },
    // };

    // console.log('sshetdata==============================', sheedDAta);
    const columns = sheet.columns.slice(0, 10).map((col: any) => ({
      id: col.id,
      title: col.title,
      type: col.type,
    }));
    const rows = sheet.rows.slice(0, 10).map((row: any) => ({
      id: row.id,
      cells: row.cells.map((cell: any) => cell.value), // Extract cell values
    }));

    // console.log(
    //   'cloumn===================================================>',
    //   columns,
    // );
    // console.log(
    //   'rows=================================================?>',
    //   rows,
    // );
    // const convertedData = rows.map((row: any) => {
    //   const obj: any = {};
    //   row.cells.forEach((value: any, index: number) => {
    //     const columnTitle = columns[index].title;
    //     obj[columnTitle] = value;
    //   });
    //   return obj;
    // });
    // const convertedData = rows.map((row) => {
    //   const obj = {};
    //   row.cells.forEach((value, index) => {
    //     const columnTitle = columns[index].title;
    //     obj[columnTitle] = value !== undefined ? value : null; // Ensure undefined fields are set to null
    //   });
    //   return obj;
    // });

    const convertedData = rows.map((row: any) => {
      const obj: any = {};
      row.cells.forEach((value: any, index: number) => {
        const columnTitle = columns[index].title;
        obj[columnTitle] = value !== undefined ? value : null; // Ensure undefined fields are set to null
      });
      return obj;
    });

    // Filter out undefined values and ensure all columns are present
    const finalData = convertedData.map((row: any) => {
      const result: any = {};
      columns.forEach((col: any) => {
        const title: any = col.title;
        // Set value to null if missing
        result[title] = row[title] !== undefined ? row[title] : null;
      });
      return result;
    });
    const updatedColumns = columns.map((col: any) => col.title);
    return { title: sheet.name, columns: updatedColumns, data: finalData };
  } catch (error) {
    return { success: false, message: 'Failed to fetch sheet', error };
  }
};

export default getSpecificSheet;
