export interface SearchResult {
  name: string;
  categoryName?: string;
  foundIn?: string;
}

export const SEARCH_FILTER_ARR = ['phenotype', 'study', 'technology' , 'none'] as const;
export type SEARCH_FILTER = typeof SEARCH_FILTER_ARR[any];
