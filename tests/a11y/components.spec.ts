import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * アクセシビリティテスト - コンポーネント単位
 * インタラクティブな要素の詳細チェック
 */

// アニメーション完了を待つヘルパー関数
const waitForAnimations = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
};

test.describe("ナビゲーション", () => {
  test("グローバルナビゲーションのアクセシビリティ", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "networkidle",
    });

    await waitForAnimations(page);
    const accessibilityScanResults = await new AxeBuilder({ page }).include(["nav"]).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("ナビゲーションにキーボードトラップがないこと", async ({ page }) => {
    await page.goto("/", {
      waitUntil: "networkidle",
    });

    await waitForAnimations(page);
    const accessibilityScanResults = await new AxeBuilder({ page }).include(["nav"]).withTags(["wcag2a"]).analyze();

    const trapViolations = accessibilityScanResults.violations.filter((v) => v.id === "keyboard" || v.id === "no-keyboard-trap");

    expect(trapViolations).toEqual([]);
  });

  test("モバイルメニューのキーボード操作", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await waitForAnimations(page);

    // ハンバーガーメニューボタンをTabキーでフォーカス
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Enterキーでメニューを開く
    await page.keyboard.press("Enter");

    // メニュー展開のアニメーション完了を待つ
    await page.waitForTimeout(500);

    const accessibilityScanResults = await new AxeBuilder({ page }).include(["nav"]).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("サブメニューの展開・折りたたみ", async ({ page }) => {
    await page.goto("/");
    await waitForAnimations(page);

    // 「サンプル」メニューにサブメニューがある場合
    const subMenuButton = page.locator('button[aria-label*="子メニュー"]');
    if ((await subMenuButton.count()) > 0) {
      await subMenuButton.first().click();

      // メニュー展開のアニメーション完了を待つ
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page }).include([".subMenu"]).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

test.describe("フォーム", () => {
  test.skip("お問い合わせフォームのアクセシビリティ", async ({ page }) => {
    await page.goto("/contact/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).include(["form"]).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test.skip("フォームのラベルが正しく関連付けられていること", async ({ page }) => {
    await page.goto("/contact/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).include(["form"]).withTags(["wcag2a"]).analyze();

    const labelViolations = accessibilityScanResults.violations.filter((v) => v.id === "label" || v.id === "label-title-only" || v.id === "form-field-multiple-labels");

    expect(labelViolations).toEqual([]);
  });

  test.skip("フォームエラーメッセージの通知", async ({ page }) => {
    await page.goto("/contact/");
    await waitForAnimations(page);

    // 送信ボタンをクリック（バリデーションエラー発生）
    await page.click('button[type="submit"]');

    // バリデーション完了を待つ
    await page.waitForTimeout(500);

    const accessibilityScanResults = await new AxeBuilder({ page }).include(["form"]).analyze();

    const errorViolations = accessibilityScanResults.violations.filter((v) => v.id === "aria-valid-attr-value" || v.id === "label");

    expect(errorViolations).toEqual([]);
  });
});

test.describe("見出し・テキスト", () => {
  test("見出し構造が正しいこと", async ({ page }) => {
    await page.goto("/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const headingViolations = accessibilityScanResults.violations.filter((v) => v.id === "heading-order" || v.id === "page-has-heading-one");

    expect(headingViolations).toEqual([]);
  });

  test("リンクテキストが意味を持つこと", async ({ page }) => {
    await page.goto("/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const linkViolations = accessibilityScanResults.violations.filter((v) => v.id === "link-name");

    expect(linkViolations).toEqual([]);
  });
});

test.describe("画像・メディア", () => {
  test("画像のalt属性が適切に設定されていること", async ({ page }) => {
    await page.goto("/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const imageViolations = accessibilityScanResults.violations.filter((v) => v.id === "image-alt");

    expect(imageViolations).toEqual([]);
  });
});

test.describe("フォーカス管理", () => {
  test("フォーカス表示が適切なこと", async ({ page }) => {
    await page.goto("/");
    await waitForAnimations(page);

    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(["wcag2a"]).analyze();

    const focusViolations = accessibilityScanResults.violations.filter((v) => v.id === "focus-visible" || v.id === "focus-order-semantics");

    expect(focusViolations).toEqual([]);
  });

  test("スキップリンクが機能すること", async ({ page, browserName }, testInfo) => {
    // WebKit/Mobile Safariではスキップリンクのフォーカステストをスキップ
    if (browserName === "webkit") {
      testInfo.skip();
    }

    await page.goto("/");
    await waitForAnimations(page);

    // Tabキーでスキップリンクにフォーカス
    await page.keyboard.press("Tab");

    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();

    // キーボード入力で実行
    await page.keyboard.press("Enter");

    // ハッシュナビゲーション後、少し待機
    await page.waitForTimeout(100);

    const main = page.locator("#main");
    await expect(main).toBeVisible();
  });
});
