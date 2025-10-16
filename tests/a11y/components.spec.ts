import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * アクセシビリティテスト - コンポーネント単位
 * インタラクティブな要素の詳細チェック
 */

test.describe('ナビゲーション', () => {
	test('グローバルナビゲーションのアクセシビリティ', async ({ page }) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.include(['nav'])
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test('モバイルメニューのキーボード操作', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// ハンバーガーメニューボタンをTabキーでフォーカス
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Enterキーでメニューを開く
		await page.keyboard.press('Enter');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.include(['nav'])
			.analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test('サブメニューの展開・折りたたみ', async ({ page }) => {
		await page.goto('/');

		// 「サンプル」メニューにサブメニューがある場合
		const subMenuButton = page.locator('button[aria-label*="子メニュー"]');
		if (await subMenuButton.count() > 0) {
			await subMenuButton.first().click();

			const accessibilityScanResults = await new AxeBuilder({ page })
				.include(['.subMenu'])
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		}
	});
});

test.describe('フォーム', () => {
	test.skip('お問い合わせフォームのアクセシビリティ', async ({ page }) => {
		// フォームページがある場合に有効化
		await page.goto('/contact/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.include(['form'])
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test.skip('フォームエラーメッセージの通知', async ({ page }) => {
		// フォームページがある場合に有効化
		await page.goto('/contact/');

		// 送信ボタンをクリック（バリデーションエラー発生）
		await page.click('button[type="submit"]');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.include(['form'])
			.analyze();

		const errorViolations = accessibilityScanResults.violations.filter(
			(v) => v.id === 'aria-valid-attr-value' || v.id === 'label'
		);

		expect(errorViolations).toEqual([]);
	});
});

test.describe('画像・メディア', () => {
	test('画像のalt属性が適切に設定されていること', async ({ page }) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a'])
			.analyze();

		const imageViolations = accessibilityScanResults.violations.filter(
			(v) => v.id === 'image-alt'
		);

		expect(imageViolations).toEqual([]);
	});
});

test.describe('フォーカス管理', () => {
	test('フォーカス表示が適切なこと', async ({ page }) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a'])
			.analyze();

		const focusViolations = accessibilityScanResults.violations.filter(
			(v) => v.id === 'focus-visible' || v.id === 'focus-order-semantics'
		);

		expect(focusViolations).toEqual([]);
	});

	test('スキップリンクが機能すること', async ({ page }) => {
		await page.goto('/');

		// Tabキーでスキップリンクにフォーカス
		await page.keyboard.press('Tab');

		const skipLink = page.locator('a[href="#main"]');
		await expect(skipLink).toBeFocused();

		// Enterキーでメインコンテンツに移動
		await page.keyboard.press('Enter');

		const main = page.locator('#main');
		await expect(main).toBeVisible();
	});
});
