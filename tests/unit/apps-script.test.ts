// Runs google-apps-script/Code.gs in a sandbox with fake Google services,
// so the enquiry backend is tested without deploying it.
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

interface Sent { to: string; subject: string; body: string; options: { htmlBody: string; replyTo?: string; name: string } }
type Row = unknown[]

/** Chainable stand-in for Apps Script builder objects: every call returns the builder; build() returns its log. */
function builder(log: unknown[] = []): unknown {
  return new Proxy({}, {
    get: (_, prop: string) => (...args: unknown[]) => {
      if (prop === 'build') return log
      log.push([prop, ...args])
      return builder(log)
    },
  })
}

function fakeSheet() {
  const rows: Row[] = []
  const validations = new Map<number, unknown>()
  const formats: Record<string, unknown[]> = {}
  const state = { tabColor: null as string | null, rules: [] as unknown[], created: false }

  const range = (r: number, c: number, nr = 1, nc = 1) => {
    const self: Record<string, (...a: never[]) => unknown> = {
      setValues: (vals: Row[]) => { vals.forEach((v, i) => (rows[r - 1 + i] = v)); return proxy },
      getValues: () => rows.slice(r - 1, r - 1 + nr).map((row) => row.slice(c - 1, c - 1 + nc)),
      setDataValidation: (v: unknown) => { for (let i = 0; i < nr; i++) validations.set(r + i, v); return proxy },
      getSheet: () => sheet,
      getColumn: () => c,
      getLastColumn: () => c + nc - 1,
    }
    // Any other method (setFontWeight, setBackground, setNumberFormat…) is recorded and chainable.
    const proxy: unknown = new Proxy(self, {
      get: (t, prop: string) =>
        prop in t ? t[prop] : (...a: unknown[]) => { (formats[`${r},${c}`] ??= []).push([prop, ...a]); return proxy },
    })
    return proxy as typeof self
  }

  const sheet = {
    getName: () => 'Enquiries',
    getSheetId: () => 42,
    appendRow: (row: Row) => { rows.push(row); return sheet },
    insertRowBefore: (n: number) => { rows.splice(n - 1, 0, []); return sheet },
    getRange: (a: number | string, c?: number, nr?: number, nc?: number) => (typeof a === 'string' ? range(1, 1) : range(a, c!, nr, nc)),
    getLastRow: () => rows.length,
    setFrozenRows: () => sheet,
    setTabColor: (color: string | null) => { state.tabColor = color; return sheet },
    getConditionalFormatRules: () => state.rules,
    setConditionalFormatRules: (r: unknown[]) => { state.rules = r; return sheet },
  }
  return { sheet, rows, validations, formats, state }
}

function loadScript() {
  const fake = fakeSheet()
  const sent: Sent[] = []
  const sandbox = {
    console,
    Date,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: () => (fake.state.created ? fake.sheet : null),
        insertSheet: () => { fake.state.created = true; return fake.sheet },
        getUrl: () => 'https://docs.google.com/spreadsheets/d/TEST/edit',
      }),
      newDataValidation: () => builder(),
      newConditionalFormatRule: () => builder(),
    },
    MailApp: { sendEmail: (to: string, subject: string, body: string, options: Sent['options']) => sent.push({ to, subject, body, options }) },
    LockService: { getScriptLock: () => { let held = false; return { waitLock: () => { held = true }, releaseLock: () => { held = false }, hasLock: () => held } } },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s: string) => ({ setMimeType: () => ({ body: JSON.parse(s) }) }),
    },
  }
  runInNewContext(readFileSync('google-apps-script/Code.gs', 'utf8'), sandbox)
  const ctx = sandbox as unknown as {
    doPost: (e: { parameter: Record<string, string> }) => { body: { result: string; error?: string } }
    onEdit: (e: unknown) => void
  }
  return {
    post: (p: Record<string, string>) => ctx.doPost({ parameter: p }).body,
    editStatus: (row: number, value: string) => {
      fake.rows[row - 1]![fake.rows[0]!.length - 1] = value
      ctx.onEdit({ range: fake.sheet.getRange(row, fake.rows[0]!.length) })
    },
    sent,
    ...fake,
  }
}

const enquiry = { name: 'Ravi Kumar', phone: '+91 98435 02872', email: 'ravi@example.com', product: 'Hybrid Solar', message: '<b>Need</b> 10 kW', language: 'ta' }

describe('Code.gs doPost', () => {
  it('creates the header, saves the enquiry as New and emails the admin', () => {
    const s = loadScript()
    expect(s.post(enquiry)).toEqual({ result: 'success' })

    expect(s.rows[0]![0]).toBe('Received At')
    expect(s.rows[0]).toContain('Language')
    expect(s.rows[0]!.at(-1)).toBe('Status')
    const row = s.rows[1]!
    expect(row[1]).toBe('Ravi Kumar')
    expect(row[2]).toBe("'+91 98435 02872") // leading + escaped so Sheets doesn't treat it as a formula
    expect(row.at(-1)).toBe('New')

    expect(s.sent).toHaveLength(1)
    expect(s.sent[0]!.to).toBe('sun.vbss@gmail.com')
    expect(s.sent[0]!.subject).toBe('New enquiry: Ravi Kumar (+91 98435 02872) – Hybrid Solar')
    expect(s.sent[0]!.options.replyTo).toBe('ravi@example.com')
    expect(s.sent[0]!.options.htmlBody).toContain('&lt;b&gt;Need&lt;/b&gt;') // HTML escaped
    expect(s.sent[0]!.options.htmlBody).toContain('#gid=42&range=A2') // links to the new row
  })

  it('puts the newest enquiry directly under the header', () => {
    const s = loadScript()
    s.post({ ...enquiry, name: 'First' })
    s.post({ ...enquiry, name: 'Second' })
    expect(s.rows.map((r) => r[1])).toEqual(['Name', 'Second', 'First'])
  })

  it('adds a Status dropdown to each new row and status colour rules once', () => {
    const s = loadScript()
    s.post(enquiry)
    s.post(enquiry)
    expect(s.validations.has(2)).toBe(true)
    const statuses = (s.validations.get(2) as unknown[][]).find((c) => c[0] === 'requireValueInList')![1]
    expect(statuses).toEqual(['New', 'Contacted', 'Site Visit', 'Quoted', 'Won', 'Lost'])
    expect(s.state.rules).toHaveLength(6)
    const formula = (s.state.rules[0] as unknown[][]).find((c) => c[0] === 'whenFormulaSatisfied')![1]
    expect(formula).toBe('=$N1="New"') // 14 columns → status is column N
  })

  it('resets inherited header styling on inserted rows', () => {
    const s = loadScript()
    s.post(enquiry)
    expect(s.formats['2,1']).toEqual(expect.arrayContaining([['setFontWeight', 'normal'], ['setBackground', null]]))
  })

  it('turns the tab orange on a new enquiry and clears it when nothing is New', () => {
    const s = loadScript()
    s.post({ ...enquiry, name: 'A' })
    s.post({ ...enquiry, name: 'B' })
    expect(s.state.tabColor).toBe('#f28c28')

    s.editStatus(2, 'Contacted')
    expect(s.state.tabColor).toBe('#f28c28') // one still New

    s.editStatus(3, 'Won')
    expect(s.state.tabColor).toBeNull()
  })

  it('escapes spreadsheet formulas in any field', () => {
    const s = loadScript()
    s.post({ ...enquiry, message: '=IMPORTXML("http://evil")' })
    expect(s.rows[1]).toContain('\'=IMPORTXML("http://evil")')
  })

  it('rejects enquiries without name or phone, without writing or emailing', () => {
    const s = loadScript()
    expect(s.post({ name: 'Ravi' }).result).toBe('error')
    expect(s.rows).toHaveLength(0)
    expect(s.sent).toHaveLength(0)
  })

  it('silently drops honeypot spam', () => {
    const s = loadScript()
    expect(s.post({ ...enquiry, website: 'http://spam' })).toEqual({ result: 'success' })
    expect(s.rows).toHaveLength(0)
    expect(s.sent).toHaveLength(0)
  })

  it('omits replyTo when the email is invalid', () => {
    const s = loadScript()
    s.post({ ...enquiry, email: 'not-an-email' })
    expect(s.sent[0]!.options.replyTo).toBeUndefined()
  })
})
