export interface GPLNODE {
  id: string;
  group: string;
  label: string;
}

export interface GPLEDGE {
  from: string | GPLNODE;
  to: string | GPLNODE;
  value: number;
}

export interface GPLCATEGORY {
  name: string;
  color?: string;
}

export interface PlatformMetadata {
  name: string;
  edges: number;
  nodes: number;
  phenotypes: number;
}


export interface GplData {
  type?: string;
  nodes: Array<GPLNODE> | [any];
  links?: Array<{ source: string, target: string, value: number }>;
  edges: Array<GPLEDGE>;
  categories: Array<GPLCATEGORY>;
}


export type Technology = 'GPL96' | 'GPL570' | 'GPL1261' | 'GPL6244' | 'GPL11154' | 'GPL13534';
