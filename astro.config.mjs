// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import viteImagemin from '@vheemstra/vite-plugin-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';

const root = import.meta.env.VITE_ROOT_PATH;
const relative = import.meta.env.VITE_ASSETS_RELATIVE;
const asset = import.meta.env.VITE_ASSETS_PATH;
const minify = import.meta.env.VITE_BUILD_MINIFY;

// https://astro.build/config
export default defineConfig({
	publicDir: './src/public',
	outDir: 'htdocs',
	compressHTML: minify === 'true' ? true : false,
	server: {
		host: true,
	},
	build: {
		assets: asset,
	},
	vite: {
		build: {
			assetsInlineLimit: 0, //画像をインライン化するサイズ
			minify: minify === 'true' ? 'esbuild' : false,
			rollupOptions: {
				output: {
					entryFileNames: `${root ? root + '/' + asset : asset}/js/app.js`,
					assetFileNames: (assetInfo) => {
						let extType = assetInfo.names[0];
						//Webフォントファイルの振り分け
						if (/ttf|otf|eot|woff|woff2/i.test(extType)) {
							extType = 'fonts';
						}
						if (/png|jpe?g|webp|svg|gif|tiff|bmp|ico/i.test(extType)) {
							extType = 'img';
						}
						//ビルド時のCSS名を明記してコントロールする
						if (/css/i.test(extType)) {
							return `${
								root && relative === 'false' ? root + '/' + asset : asset
							}/css/[name].css`;
						}
						return `${
							root && relative === 'false' ? root + '/' + asset : asset
						}/${extType}/[name][extname]`;
					},
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
          @use "./src/scss/abstracts/_mixins.scss" as mixin;
          @use "./src/scss/abstracts/_variables.scss" as var;
          @use "./src/scss/abstracts/_functions.scss" as fun;
          `,
				},
			},
		},
		plugins: [
			tailwindcss(),
			viteImagemin({
				plugins: {
					jpg: imageminMozjpeg({ quality: 85 }),
					png: imageminPngquant({ quality: [0.8, 0.9], speed: 4 }),
					svgo: imageminSvgo({
						plugins: [
							{
								name: 'removeViewBox',
							},
							{
								name: 'removeEmptyAttrs',
								active: false,
							},
						],
					}),
				},
				makeWebp: {
					plugins: {
						jpg: imageminWebp(),
					},
				},
			}),
		],
	},
});
