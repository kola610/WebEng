import { csv2json } from "json-2-csv";

export type CSV_Data = Array<Record<string, unknown>>;
const convertCSVtoJSON = async (csvText: string) => {
  // Type cast OK, as the typing of the external library is not perfect.
  return (await csv2json(csvText)) as CSV_Data;
};

/**
 * Reads a CSV file and returns the data as JSON.
 * @param event The change event of the file input.
 */
export const readCSV = async (event: Event): Promise<CSV_Data> => {
  if (!(event.target instanceof HTMLInputElement)) {
    throw new Error("Not an HTMLInputElement");
  }

  const file = event.target.files?.[0];

  if (file == null) {
    throw new Error("No file selected");
  }

  const result = await file.text();

  return await convertCSVtoJSON(result);
};
