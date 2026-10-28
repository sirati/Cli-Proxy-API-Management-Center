import { describe, expect, spyOn, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../src/i18n/index';
import { UseOnceButtons } from '../src/features/authFiles/components/UseOnceButtons';
import { authFilesApi, normalizeAuthFilesResponse } from '../src/services/api/authFiles';
import { apiClient } from '../src/services/api/client';

const render = (minRemaining: number) =>
  renderToStaticMarkup(
    createElement(UseOnceButtons, {
      minRemaining,
      routingStopped: true,
      disabled: false,
      onStart() {},
    })
  );

describe('use once credential actions', () => {
  test('normalizes routing stop independently of credential disabled status', () => {
    const file = normalizeAuthFilesResponse({
      files: [
        {
          name: 'once.json',
          use_once: true,
          min_remaining: 25,
          routing_stopped: true,
          disabled: false,
        },
      ],
    }).files[0];
    expect(file.useOnce).toBe(true);
    expect(file.routingStopped).toBe(true);
    expect(file.minRemaining).toBe(25);
    expect(file.disabled).toBe(false);
  });

  test('shows saved percentage and zero actions without an enable switch', async () => {
    await i18n.changeLanguage('en');
    const html = render(25);
    expect(html).toContain('Use once to 25%');
    expect(html).toContain('Use once to 0%');
    expect(html).toContain('Enabled, routing stopped');
    expect(html).not.toContain('role="switch"');
    const zero = render(0);
    expect(zero).toContain('>Use once</span>');
    expect(zero).not.toContain('Use once to');
    expect(zero).not.toContain('role="switch"');
  });

  test('posts the selected target and identity without changing the saved minimum', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({ status: 'ok', disabled: false });
    try {
      await authFilesApi.startUseOnce('once.json', 0, 'index-1');
      expect(post).toHaveBeenCalledWith('/credentials/use-once', {
        name: 'once.json',
        target: 0,
        auth_index: 'index-1',
      });
    } finally {
      post.mockRestore();
    }
  });
});
