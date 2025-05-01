export interface MenuItem {
	link: string;
	txt: string;
	child?: MenuItem[];
	anchor?: boolean;
	blank?: boolean;
}

export interface CommonConfig {
	head: {
		siteName: string;
		domain: string;
		favicon: string;
		ogImg: string;
		logo: string;
		copyright: string;
		webfont: string;
		twitterName?: string;
		facebookID?: string;
	};
	menu: MenuItem[];
}

export const common: CommonConfig = {
	head: {
		siteName: '◯◯◯◯◯◯',
		domain: 'https://www.XXXXX.XX.XX/',
		favicon: '/favicon.ico',
		ogImg: 'https://www.XXXXX.XX.XX/_assets/img/ogimg.jpg',
		logo: 'https://www.XXXXX.XX.XX/_assets/img/logo.svg', // JSON LD用企業ロゴ
		copyright: 'XXXX',
		webfont:
			'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap', // 不要の場合は空
		twitterName: '', // Twitterアカウントある場合記述
		facebookID: '', // Facebookアカウントある場合記述
	},
	menu: [
		{
			link: '/',
			txt: 'トップ',
		},
		{
			link: '/news/',
			txt: 'お知らせ',
		},
		{
			link: '/about/',
			txt: '概要',
		},
		{
			link: '/component/',
			txt: 'コンポーネント',
			child: [
				{
					link: '#tab',
					txt: 'タブ',
					anchor: true,
				},
				{
					link: '#accordion',
					txt: 'アコーディオン',
					blank: true,
					anchor: true,
				},
			],
		},
	],
};
