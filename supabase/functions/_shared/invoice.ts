// Build a one-page PDF invoice with pdf-lib.
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  academyName: string;
  academyEmail: string;
  academyPhone: string;
  academyAddress: string;
  billName: string;
  billEmail: string;
  billPhone: string;
  courseTitle: string;
  amount: number;
  currency: string;
  bankHolder: string;
  bankName: string;
  bankIban: string;
  bankSwift: string;
  note: string;
}

export async function buildInvoicePdf(d: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.79, 0.64, 0.29);
  const dark = rgb(0.1, 0.1, 0.12);
  const grey = rgb(0.45, 0.45, 0.45);

  const M = 50;
  let y = 792;
  const text = (s: string, x: number, yy: number, size = 10, f = font, color = dark) =>
    page.drawText(String(s ?? ""), { x, y: yy, size, font: f, color });

  // header
  text(d.academyName, M, y, 22, bold, dark);
  text("INVOICE", 595 - M - bold.widthOfTextAtSize("INVOICE", 22), y, 22, bold, gold);
  y -= 18;
  text(`${d.academyAddress}`, M, y, 9, font, grey);
  text(`# ${d.invoiceNo}`, 595 - M - font.widthOfTextAtSize(`# ${d.invoiceNo}`, 10), y, 10, font, grey);
  y -= 13;
  text(`${d.academyEmail}  ·  ${d.academyPhone}`, M, y, 9, font, grey);
  text(`Date: ${d.date}`, 595 - M - font.widthOfTextAtSize(`Date: ${d.date}`, 10), y, 10, font, grey);

  y -= 30;
  page.drawLine({ start: { x: M, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });

  // bill to
  y -= 28;
  text("BILL TO", M, y, 9, bold, grey);
  y -= 16;
  text(d.billName, M, y, 12, bold, dark);
  y -= 14;
  text(d.billEmail, M, y, 10, font, grey);
  y -= 13;
  if (d.billPhone) text(d.billPhone, M, y, 10, font, grey);

  // line item table
  y -= 36;
  page.drawRectangle({ x: M, y: y - 6, width: 495, height: 26, color: rgb(0.96, 0.96, 0.96) });
  text("DESCRIPTION", M + 8, y, 9, bold, grey);
  text("AMOUNT", 545 - 8 - bold.widthOfTextAtSize("AMOUNT", 9), y, 9, bold, grey);
  y -= 30;
  text(d.courseTitle, M + 8, y, 11, font, dark);
  const amt = `${d.currency}${d.amount.toLocaleString()}`;
  text(amt, 545 - 8 - font.widthOfTextAtSize(amt, 11), y, 11, font, dark);

  y -= 14;
  page.drawLine({ start: { x: M, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 24;
  text("TOTAL DUE", 545 - 8 - 120, y, 11, bold, dark);
  text(amt, 545 - 8 - font.widthOfTextAtSize(amt, 13), y, 13, bold, gold);

  // bank details box
  y -= 50;
  page.drawRectangle({ x: M, y: y - 96, width: 495, height: 110, borderColor: gold, borderWidth: 1, color: rgb(0.99, 0.98, 0.95) });
  let by = y - 4;
  text("PAY BY BANK TRANSFER", M + 14, by, 9, bold, gold);
  by -= 20;
  const row = (k: string, v: string) => { text(k, M + 14, by, 9, font, grey); text(v, M + 150, by, 10, bold, dark); by -= 17; };
  row("Account holder", d.bankHolder);
  row("Bank", d.bankName);
  row("IBAN", d.bankIban);
  if (d.bankSwift) row("SWIFT/BIC", d.bankSwift);
  row("Reference", d.invoiceNo);

  // note
  y -= 120;
  const wrap = (s: string, max: number) => {
    const words = s.split(" "); const lines: string[] = []; let line = "";
    for (const w of words) { if ((line + " " + w).trim().length > max) { lines.push(line.trim()); line = w; } else line += " " + w; }
    if (line.trim()) lines.push(line.trim());
    return lines;
  };
  for (const ln of wrap(d.note, 95)) { text(ln, M, y, 9, font, grey); y -= 13; }

  // footer
  text(`${d.academyName} — thank you!`, M, 50, 9, font, grey);

  return await doc.save();
}
