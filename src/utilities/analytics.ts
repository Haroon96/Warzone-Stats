import { GoogleSpreadsheet } from "google-spreadsheet";

export async function updateAnalyticsSheet (command: String, guildId: String) {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

    await doc.useServiceAccountAuth({
        client_email: process.env.SHEET_EMAIL,
        private_key: process.env.SHEET_KEY
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    sheet.addRow([new Date(), command, guildId]);
}