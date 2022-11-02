import * as jsUtils from '@common/jsUtils';

describe('jsUtils', () => {
  describe('ifUndefinedString', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefinedString(undefined, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefinedString(null, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the non-default input value for regular string input', () => {
      const result = jsUtils.ifUndefinedString('some random string', 'abc');
      expect(result).toEqual('some random string');
    });
  });

  describe('ifUndefined<string>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<string>(undefined, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<string>(null, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the non-default input value for regular string input', () => {
      const result = jsUtils.ifUndefined<string>('some random string', 'abc');
      expect(result).toEqual('some random string');
    });
  });

  describe('ifUndefined<boolean>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<boolean>(undefined, false);
      expect(result).toEqual(false);
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<boolean>(null, true);
      expect(result).toEqual(true);
    });

    it('returns the non-default input value for regular boolean input', () => {
      const result = jsUtils.ifUndefined<boolean>(true, false);
      expect(result).toEqual(true);
    });
  });

  describe('ifUndefined<number>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<number>(undefined, 123);
      expect(result).toEqual(123);
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<number>(null, 234);
      expect(result).toEqual(234);
    });

    it('returns the non-default input value for regular Number input', () => {
      const result = jsUtils.ifUndefined<number>(1234, 5678);
      expect(result).toEqual(1234);
    });
  });

  describe('convertToJSON', () => {
    it('returns undefined for undefined input', () => {
      const result = jsUtils.convertToJSON(undefined);
      expect(result).toEqual(undefined);
    });

    it('returns null for null input', () => {
      const result = jsUtils.convertToJSON(null);
      expect(result).toEqual(null);
    });

    it('returns the object for the object input', () => {
      const result = jsUtils.convertToJSON(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('returns the parsed JSON for the string input', () => {
      const result1 = jsUtils.convertToJSON('{"a":"b","c":"d"}');
      expect(result1).toEqual({ a: 'b', c: 'd' });

      const result2 = jsUtils.convertToJSON('[{"a":"b"},{"c":"d"}]');
      expect(result2).toEqual([{ a: 'b' }, { c: 'd' }]);
    });
  });

  describe('cleanseJSObject', () => {
    xit('throws error for undefined input', () => {
      const result = jsUtils.cleanseJSObject(undefined);
      expect(result).toThrow();
    });

    xit('throws error for null input', () => {
      const result = jsUtils.cleanseJSObject(null);
      expect(result).toThrow();
    });

    it('returns cloned object for valid input', () => {
      const result = jsUtils.cleanseJSObject([{ a: 'b' }, { c: 'd' }]);
      expect(result).toEqual([{ a: 'b' }, { c: 'd' }]);
    });
  });

  describe('isEscKeyPress', () => {
    it('returns true if the key number is 27', () => {
      const result = jsUtils.isEscKeyPress(27);
      expect(result).toEqual(true);
    });

    it('returns false if the key number is 27', () => {
      const result = jsUtils.isEscKeyPress(28);
      expect(result).toEqual(false);
    });
  });
});
