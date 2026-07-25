import { describe, expect, it } from 'vitest'
import { isNewer } from './update'

describe('isNewer', () => {
  it('compares numeric version segments', () => {
    expect(isNewer('v1.0.10', '1.0.9')).toBe(true)
    expect(isNewer('1.0.0', '1')).toBe(false)
    expect(isNewer('1.2', '1.10')).toBe(false)
  })
})
