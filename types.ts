
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  views: string;
  uploadDate: string;
}

export interface GeminiSearchResponse {
  detectedLanguage: string;
  translatedQuery: string;
  videos: Video[];
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export type SearchStatus = 'idle' | 'pending' | 'success' | 'error';
