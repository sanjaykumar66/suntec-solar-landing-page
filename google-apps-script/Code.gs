/**
 * Suntec website enquiry handler (Google Apps Script web app).
 *
 * - Inserts every enquiry at the TOP of the bound Google Sheet ("Enquiries" tab), newest first.
 * - New enquiries are highlighted; the Status dropdown recolours the row as the team follows up.
 * - The tab turns orange while any enquiry is still "New".
 * - Emails the admin(s) a notification for each new enquiry.
 *
 * Setup: see README.md → "Enquiry form setup".
 * After editing this file: Deploy → Manage deployments → Edit → Version: New version → Deploy.
 */

// Who gets notified. Comma-separate multiple addresses.
const ADMIN_EMAILS = 'sun.vbss@gmail.com';
const SHEET_NAME = 'Enquiries';

const FIELDS = [
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['city', 'City / Location'],
  ['customerType', 'Customer Type (EB Tariff)'],
  ['product', 'Interested In'],
  ['roofType', 'Roof Type'],
  ['monthlyBill', 'Avg. Monthly EB Bill'],
  ['ebNumber', 'EB Consumer No.'],
  ['message', 'Message'],
  ['language', 'Language'],
  ['page', 'Submitted From'],
];

// Follow-up stages and their row colours.
const STATUSES = [
  { name: 'New', background: '#ffe0b2', bold: true },
  { name: 'Contacted', background: '#fff8c5' },
  { name: 'Site Visit', background: '#dbeafe' },
  { name: 'Quoted', background: '#e0e7ff' },
  { name: 'Won', background: '#d9f2d0' },
  { name: 'Lost', background: '#eeeeee', fontColor: '#888888' },
];
const NEW_TAB_COLOR = '#f28c28';

const HEADERS = ['Received At'].concat(FIELDS.map(([, label]) => label), ['Status']);
const STATUS_COL = HEADERS.length; // last column

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};

    if (p.website) return json_({ result: 'success' }); // honeypot hit: silently drop spam
    if (!clean_(p.name) || !clean_(p.phone)) {
      return json_({ result: 'error', error: 'Name and phone are required.' });
    }

    lock.waitLock(10000);
    const sheet = getSheet_();
    const row = [new Date()].concat(FIELDS.map(([key]) => safeCell_(clean_(p[key]))), ['New']);
    insertEnquiryRow_(sheet, row);
    sheet.setTabColor(NEW_TAB_COLOR);
    lock.releaseLock();

    notifyAdmin_(p, sheet);
    return json_({ result: 'success' });
  } catch (err) {
    console.error('Enquiry failed: ' + err.stack);
    return json_({ result: 'error', error: 'Server error. Please call us instead.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  return json_({ result: 'ok', service: 'suntec-enquiries' });
}

/**
 * Simple trigger — runs automatically when anyone edits the sheet.
 * Clears the orange tab colour once no enquiry is marked "New".
 */
function onEdit(e) {
  const sheet = e && e.range && e.range.getSheet();
  if (!sheet || sheet.getName() !== SHEET_NAME) return;
  if (e.range.getColumn() > STATUS_COL || e.range.getLastColumn() < STATUS_COL) return;
  refreshTabColor_(sheet);
}

/** Optional: run once from the Apps Script editor to apply formatting to an existing sheet immediately. */
function setup() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last > 1) {
    sheet.getRange(2, STATUS_COL, last - 1, 1).setDataValidation(statusValidation_());
    sheet.getRange(2, 1, last - 1, 1).setNumberFormat('dd-mmm-yyyy hh:mm');
  }
  refreshTabColor_(sheet);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f3350').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  ensureStatusColours_(sheet);
  return sheet;
}

/** Newest enquiry goes directly under the header, with a Status dropdown. */
function insertEnquiryRow_(sheet, row) {
  sheet.insertRowBefore(2);
  const range = sheet.getRange(2, 1, 1, row.length);
  // Inserted rows copy the header's styling — reset it so status colours show through.
  range.setValues([row]).setFontWeight('normal').setFontColor('#000000').setBackground(null);
  sheet.getRange(2, 1).setNumberFormat('dd-mmm-yyyy hh:mm');
  sheet.getRange(2, STATUS_COL).setDataValidation(statusValidation_());
}

function statusValidation_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES.map((s) => s.name), true)
    .setAllowInvalid(false)
    .build();
}

/** Whole-row colour by Status (conditional formatting), added once per sheet. */
function ensureStatusColours_(sheet) {
  if (sheet.getConditionalFormatRules().length > 0) return;
  const statusLetter = columnLetter_(STATUS_COL);
  // Whole columns, so rows inserted at the top are always covered. Header row says "Status" so never matches.
  const range = sheet.getRange('A:' + statusLetter);
  const rules = STATUSES.map((s) => {
    let b = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + statusLetter + '1="' + s.name + '"')
      .setBackground(s.background)
      .setRanges([range]);
    if (s.bold) b = b.setBold(true);
    if (s.fontColor) b = b.setFontColor(s.fontColor);
    return b.build();
  });
  sheet.setConditionalFormatRules(rules);
}

function refreshTabColor_(sheet) {
  const last = sheet.getLastRow();
  const statuses = last > 1 ? sheet.getRange(2, STATUS_COL, last - 1, 1).getValues() : [];
  const hasNew = statuses.some((r) => r[0] === 'New');
  sheet.setTabColor(hasNew ? NEW_TAB_COLOR : null);
}

function notifyAdmin_(p, sheet) {
  const rows = FIELDS
    .filter(([key]) => clean_(p[key]))
    .map(([key, label]) =>
      '<tr><td style="padding:6px 12px;color:#5b6878">' + label + '</td>' +
      '<td style="padding:6px 12px;font-weight:600">' + escape_(clean_(p[key])) + '</td></tr>')
    .join('');

  // Link straight to the Enquiries tab, where the new row is at the top.
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl() + '#gid=' + sheet.getSheetId() + '&range=A2';
  const html =
    '<div style="font-family:Arial,sans-serif">' +
    '<h2 style="color:#d9711a;margin:0 0 12px">New website enquiry</h2>' +
    '<table style="border-collapse:collapse">' + rows + '</table>' +
    '<p style="margin-top:18px"><a href="' + sheetUrl + '">Open enquiries sheet</a></p></div>';

  const options = { htmlBody: html, name: 'Suntec Website' };
  const email = clean_(p.email);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) options.replyTo = email;

  MailApp.sendEmail(
    ADMIN_EMAILS,
    'New enquiry: ' + clean_(p.name) + ' (' + clean_(p.phone) + ')' + (p.product ? ' – ' + clean_(p.product) : ''),
    'New enquiry from ' + clean_(p.name) + ', phone ' + clean_(p.phone) + '. Open the sheet: ' + sheetUrl,
    options
  );
}

function columnLetter_(n) {
  let s = '';
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, 2000);
}

// Stop spreadsheet formula injection (values starting with = + - @).
function safeCell_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function escape_(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
