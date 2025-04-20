import '@jest/globals';
import { scaffoldMap } from '../index';
import { ScaffoldType } from '../types';

describe('scaffoldMap', () => {
  it('should contain all required scaffold types', () => {
    const expectedTypes: ScaffoldType[] = ['transformer', 'reader', 'writer'];
    expect(Object.keys(scaffoldMap)).toEqual(expectedTypes);
  });
}); 