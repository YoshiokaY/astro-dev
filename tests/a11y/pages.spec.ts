import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * アクセシビリティテスト - ページ単位
 * WCAG 2.1 Level AA準拠チェック
 */

const pages = [
	{ name: 'トップページ', url: '/' },
	{ name: '概要ページ', url: '/about/' },
	{ name: 'サンプルページ', url: '/sample/' },
	{ name: 'プライバシーポリシー', url: '/privacy/' },
];

pages.forEach(({ name, url }) => {
	test.describe(`${name} (${url})`, () => {
		test('アクセシビリティ違反がないこと', async ({ page }) => {
			await page.goto(url);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test('カラーコントラストが基準を満たすこと', async ({ page }) => {
			await page.goto(url);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2aa'])
				.include(['body'])
				.analyze();

			const contrastViolations = accessibilityScanResults.violations.filter(
				(v) => v.id === 'color-contrast'
			);

			expect(contrastViolations).toEqual([]);
		});

		test('キーボードナビゲーションが可能なこと', async ({ page }) => {
			await page.goto(url);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag21a'])
				.analyze();

			const keyboardViolations = accessibilityScanResults.violations.filter(
				(v) => v.id === 'keyboard' || v.id === 'focus-order-semantics'
			);

			expect(keyboardViolations).toEqual([]);
		});

		test('ARIA属性が適切に使用されていること', async ({ page }) => {
			await page.goto(url);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa'])
				.analyze();

			const ariaViolations = accessibilityScanResults.violations.filter((v) =>
				v.id.startsWith('aria-')
			);

			expect(ariaViolations).toEqual([]);
		});
	});
});
