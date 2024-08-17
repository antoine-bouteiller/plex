export type MediaStream = {
  title: string;
  selected: boolean;
  id: number;
  streamType: number;
  languageCode: string;
};

export type Media = {
  Media: {
    Part: {
      id: number;
      file: string;
      Stream: MediaStream[];
    }[];
  }[];
  key: string;
  title: string;
  ratingKey: string;
  type: string;
  grandparentTitle?: string;
  parentTitle?: string;
  primaryExtraKey: string;
  year: number;
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
      }
    ];
  };
};

export type TreatedMedias = {
  [key: number]: string[];
};
