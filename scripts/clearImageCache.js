#!/usr/bin/env node
import { clearCache, getCacheDir } from "../plugins/imageCache.js";

const removed = clearCache();
console.log(`🗑️  画像最適化キャッシュを削除しました: ${removed}件 (${getCacheDir()})`);
