import { describe, expect, it } from 'vitest'
import en from '../../app/content/en'
import ta from '../../app/content/ta'

// Types guarantee every key exists; these checks catch lists that drift out of step.
type Json = string | number | boolean | undefined | Json[] | { [k: string]: Json }

function shape(v: Json): Json {
  if (Array.isArray(v)) return v.map(shape)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]))
  return typeof v
}

describe('Tamil content', () => {
  it('has the same structure and list lengths as English', () => {
    expect(shape(ta as unknown as Json)).toEqual(shape(en as unknown as Json))
  })

  it('has no empty strings', () => {
    const empties: string[] = []
    const walk = (v: Json, path: string) => {
      if (typeof v === 'string' && v.trim() === '' && !path.endsWith('.text')) empties.push(path)
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`))
    }
    walk(ta as unknown as Json, 'ta')
    expect(empties).toEqual([])
  })
})
