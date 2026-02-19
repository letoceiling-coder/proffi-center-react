/**
 * Проверка страницы /calc/: загрузка, наличие #app, попап клиента (если авторизован).
 * PLAYWRIGHT_BASE_URL=https://proffi-center.ru npx playwright test tests/calc-popup.spec.js
 */
import { test, expect } from '@playwright/test';

const CALC_URL = process.env.CALC_URL || 'https://proffi-center.ru/calc/';

test.describe('Calc page', () => {
  test('loads and has #app; check popup_client in DOM', async ({ page }) => {
    test.setTimeout(60000);
    const logs = [];
    page.on('console', (msg) => {
      try { logs.push(`[${msg.type()}] ${msg.text()}`); } catch (_) {}
    });

    await page.goto(CALC_URL, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(5000);

    const info = await page.evaluate(() => {
      const app = document.getElementById('app');
      const popup = document.getElementById('popup_client');
      const hasContent = app?.innerHTML?.length > 0;
      const popupDisplay = popup ? window.getComputedStyle(popup).display : 'none';
      const popupVisibility = popup ? window.getComputedStyle(popup).visibility : 'hidden';
      const bodyChildren = document.body?.children?.length ?? 0;
      const inBody = popup?.parentElement?.tagName === 'BODY';
      return {
        hasApp: !!app,
        appInnerLength: app?.innerHTML?.length ?? 0,
        hasPopupEl: !!popup,
        popupDisplay,
        popupVisibility,
        bodyChildren,
        inBody,
        htmlSnippet: popup ? popup.outerHTML.substring(0, 500) : 'no popup',
      };
    });

    console.log('Calc page check:', JSON.stringify(info, null, 2));
    console.log('Console logs (last 15):', logs.slice(-15));

    expect(info.hasApp).toBe(true);

    if (info.hasPopupEl) {
      console.log('popup_client found. display=', info.popupDisplay, 'visibility=', info.popupVisibility);
      if (info.popupDisplay === 'none') {
        console.log('Popup is in DOM but display:none - Vue v-show may be hiding it.');
      }
    } else {
      console.log('popup_client NOT in DOM - ClientPopup may not be mounted or Teleport not rendered yet.');
    }
  });
});
