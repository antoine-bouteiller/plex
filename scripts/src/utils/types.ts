export type MediaStream = {
	streamType: number;
	languageTag: string;
	title: string;
};

export type Media = {
	Media: {
		Part: {
			id: number;
		}[];
	}[];
	key: string;
	title: string;
	ratingKey: string;
	type: string;
};

export type PlexReponse = {
	MediaContainer: {
		Metadata: Media[];
	};
};

export type Config = {
	targets: {
		plex: [
			{
				url: string;
				token: string;
			},
		];
	};
};
