import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { TEST_PAGES } from "../../test-config.js";

/**
 * アクセシビリティテスト - ページ単位
 * WCAG 2.1 Level AA準拠チェック
 */

const pages = TEST_PAGES.map((page) => ({
  name: page.name,
  url: page.path,
}));

pages.forEach(({ name, url }) => {
  test.describe(`${name} (${url})`, () => {
    // アニメーション完了を待つヘルパー関数
    const waitForAnimations = async (page: Page) => {
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000); // アニメーション完了を待つ
    };

    test("ページタイトルが設定されていること", async ({ page }) => {
      await page.goto(url);

      const title = await page.title();
      expect(title).not.toBe("");
      expect(title.length).toBeGreaterThan(0);
    });

    test("ページの言語属性が設定されていること", async ({ page }) => {
      await page.goto(url);

      const lang = await page.getAttribute("html", "lang");
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // ja, en, ja-JP など
    });

    test("見出し構造が正しいこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

      const headingViolations = accessibilityScanResults.violations.filter((v) => v.id === "heading-order" || v.id === "page-has-heading-one");

      expect(headingViolations).toEqual([]);
    });

    test("リンクテキストが意味を持つこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

      const linkViolations = accessibilityScanResults.violations.filter((v) => v.id === "link-name");

      expect(linkViolations).toEqual([]);
    });

    test("アクセシビリティ違反がないこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

      // カラーコントラストは専用テストで検証するため除外
      const violationsWithoutContrast = accessibilityScanResults.violations.filter((v) => v.id !== "color-contrast");

      expect(violationsWithoutContrast).toEqual([]);
    });

    test("カラーコントラストが基準を満たすこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2aa"]).include(["body"]).analyze();

      const contrastViolations = accessibilityScanResults.violations.filter((v) => v.id === "color-contrast");

      expect(contrastViolations).toEqual([]);
    });

    test("キーボードナビゲーションが可能なこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag21a"]).analyze();

      const keyboardViolations = accessibilityScanResults.violations.filter((v) => v.id === "keyboard" || v.id === "focus-order-semantics");

      expect(keyboardViolations).toEqual([]);
    });

    test("ARIA属性が適切に使用されていること", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

      const ariaViolations = accessibilityScanResults.violations.filter((v) => v.id.startsWith("aria-"));

      expect(ariaViolations).toEqual([]);
    });

    test("キーボードトラップがないこと", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

      const trapViolations = accessibilityScanResults.violations.filter((v) => v.id === "keyboard" || v.id === "no-keyboard-trap");

      expect(trapViolations).toEqual([]);
    });

    test("フォームのラベルが正しく関連付けられていること", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const formCount = await page.locator("form").count();

      if (formCount > 0) {
        const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

        const labelViolations = accessibilityScanResults.violations.filter((v) => v.id === "label" || v.id === "label-title-only" || v.id === "form-field-multiple-labels");

        expect(labelViolations).toEqual([]);
      }
    });

    test("テーブルのヘッダーが正しく関連付けられていること", async ({ page }) => {
      await page.goto(url);
      await waitForAnimations(page);

      const tableCount = await page.locator("table").count();

      if (tableCount > 0) {
        const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

        const tableViolations = accessibilityScanResults.violations.filter((v) => v.id === "table-fake-caption" || v.id === "table-duplicate-name" || v.id === "th-has-data-cells");

        expect(tableViolations).toEqual([]);
      }
    });
  });
});
