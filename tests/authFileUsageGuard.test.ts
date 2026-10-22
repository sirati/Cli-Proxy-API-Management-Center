import { describe, expect, test } from 'bun:test';
import {
  buildAuthFileFieldsPatch,
  type PrefixProxyEditorState,
} from '../src/features/authFiles/hooks/useAuthFilesPrefixProxyEditor';

const makeEditor = (
  json: Record<string, unknown>,
  fields: Partial<PrefixProxyEditorState>,
  providerKey = 'claude'
): PrefixProxyEditorState => ({
  fileName: 'claude.json',
  fileInfoText: '',
  loading: false,
  saving: false,
  error: null,
  originalText: JSON.stringify(json),
  rawText: JSON.stringify(json),
  invalidContentPreview: '',
  json,
  providerKey,
  prefix: '',
  proxyUrl: '',
  priority: '',
  weight: '',
  weightError: null,
  minRemaining: '',
  minRemainingError: null,
  useOnce: false,
  useOnceTouched: false,
  disableCooling: false,
  disableCoolingTouched: false,
  websockets: false,
  websocketsTouched: false,
  usingApi: false,
  usingApiTouched: false,
  note: '',
  noteTouched: false,
  excludedModelsText: '',
  excludedModelsTouched: false,
  headersText: '',
  headersTouched: false,
  headersError: null,
  ...fields,
});

const resolveError = (key: string) => key;

describe('auth-file usage guard fields', () => {
  test('writes min_remaining and clears it with 0', () => {
    expect(buildAuthFileFieldsPatch(makeEditor({}, { minRemaining: '20' }), resolveError)).toEqual({
      min_remaining: 20,
    });
    expect(
      buildAuthFileFieldsPatch(makeEditor({ min_remaining: 20 }, { minRemaining: '' }), resolveError)
    ).toEqual({ min_remaining: 0 });
    expect(
      buildAuthFileFieldsPatch(makeEditor({ min_remaining: 20 }, { minRemaining: '20' }), resolveError)
    ).toEqual({});
  });

  test('rejects values outside 0-100', () => {
    expect(() =>
      buildAuthFileFieldsPatch(makeEditor({}, { minRemaining: '101' }), resolveError)
    ).toThrow('auth_files.min_remaining_invalid');
  });

  test('turning use_once on resets the stored baseline', () => {
    expect(
      buildAuthFileFieldsPatch(
        makeEditor({ use_once_baseline: 40 }, { useOnce: true, useOnceTouched: true }),
        resolveError
      )
    ).toEqual({ use_once: true, use_once_baseline: null });
    expect(
      buildAuthFileFieldsPatch(
        makeEditor({ use_once: true }, { useOnce: false, useOnceTouched: true }),
        resolveError
      )
    ).toEqual({ use_once: false });
  });

  test('codex sends the fields like claude', () => {
    expect(
      buildAuthFileFieldsPatch(
        makeEditor({}, { minRemaining: '20', useOnce: true, useOnceTouched: true }, 'codex'),
        resolveError
      )
    ).toEqual({ min_remaining: 20, use_once: true, use_once_baseline: null });
  });

  test('providers without a usage endpoint never send the fields', () => {
    expect(
      buildAuthFileFieldsPatch(
        makeEditor({}, { minRemaining: '20', useOnce: true, useOnceTouched: true }, 'gemini'),
        resolveError
      )
    ).toEqual({});
  });
});
