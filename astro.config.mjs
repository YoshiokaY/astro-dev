// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	outDir: 'htdocs',
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
          @use "./src/assets/scss/abstracts/_mixins.scss" as mixin;
          @use "./src/assets/scss/abstracts/_variables.scss" as var;
          @use "./src/assets/scss/abstracts/_functions.scss" as fun;
          `,
				},
			},
		},
		plugins: [tailwindcss()],
	},
});
