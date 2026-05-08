import { describe, it, expect } from 'vitest';
import { humanizeStatus } from '../orderUtils';

describe('humanizeStatus', () => {
  it('formats snake case status', () => expect(humanizeStatus('pending')).toBe('Pending'));
  it('handles empty values', () => expect(humanizeStatus('')).toBe(''));
});