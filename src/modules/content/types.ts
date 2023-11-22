export interface PostEntity {
  id: number;
  title: string;
  summary?: string;
  body: string;
}

export type SearchType = 'like' | 'against' | 'meilli';

export interface ContentConfig {
  searchType?: SearchType;
}
