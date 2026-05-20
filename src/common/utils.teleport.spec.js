import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveTeleportTarget } from './utils.teleport';

describe('utils.teleport', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    document.body.innerHTML = '';
  });

  describe('empty / falsy selector', () => {
    it("should return 'body' string when selector is empty string", () => {
      expect(resolveTeleportTarget('')).toBe('body');
    });

    it("should return 'body' string when selector is undefined", () => {
      expect(resolveTeleportTarget(undefined)).toBe('body');
    });

    it("should return 'body' string when selector is null", () => {
      expect(resolveTeleportTarget(null)).toBe('body');
    });

    it('should not warn for empty selector (it is the disabled placeholder)', () => {
      resolveTeleportTarget('');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('matching selector', () => {
    it('should return the body element when selector is "body"', () => {
      const result = resolveTeleportTarget('body');
      expect(result).toBe(document.body);
    });

    it('should return the matched element for class selector', () => {
      const div = document.createElement('div');
      div.className = 'teleport-target';
      document.body.appendChild(div);

      const result = resolveTeleportTarget('.teleport-target');
      expect(result).toBe(div);
    });

    it('should return the matched element for id selector', () => {
      const div = document.createElement('div');
      div.id = 'teleport-root';
      document.body.appendChild(div);

      const result = resolveTeleportTarget('#teleport-root');
      expect(result).toBe(div);
    });

    it('should not warn when selector matches an element', () => {
      const div = document.createElement('div');
      div.id = 'ok';
      document.body.appendChild(div);

      resolveTeleportTarget('#ok');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('non-matching selector', () => {
    it('should fall back to document.body when selector matches nothing', () => {
      const result = resolveTeleportTarget('.does-not-exist');
      expect(result).toBe(document.body);
    });

    it('should console.warn with selector string and default component name', () => {
      resolveTeleportTarget('.does-not-exist');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0];
      expect(msg).toContain('[Component]');
      expect(msg).toContain('.does-not-exist');
      expect(msg).toContain('Falling back to document.body');
    });

    it('should use the provided componentName in the warning prefix', () => {
      resolveTeleportTarget('.missing', 'EvSelect');
      const msg = warnSpy.mock.calls[0][0];
      expect(msg).toContain('[EvSelect]');
    });
  });

  describe('invalid selector (querySelector throws)', () => {
    it('should fall back to document.body when selector is syntactically invalid', () => {
      const result = resolveTeleportTarget('..bad', 'EvSelect');
      expect(result).toBe(document.body);
    });

    it('should console.warn with the error object as a second argument', () => {
      resolveTeleportTarget('..bad', 'EvSelect');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const [msg, err] = warnSpy.mock.calls[0];
      expect(msg).toContain('[EvSelect]');
      expect(msg).toContain('..bad');
      expect(msg).toContain('is invalid');
      // jsdom throws DOMException (not a subclass of Error), real browsers may throw either.
      expect(err).toBeTruthy();
      expect(typeof err.message).toBe('string');
    });
  });
});
