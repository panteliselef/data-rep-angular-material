export type DATASET_PAIR = { dA: string, dB: string };

export interface EDGE {
  from: string | NODE;
  to: string | NODE;
  value: number;
  weight: number;
  datasetPairs: DATASET_PAIR[];
}

export interface DATASET {
  DOLink: string;
  DataAnnot: string;
  Datapath: string;
  Disease: string;
  Dsetlink: string;
  Entity: string;
  GSE: string;
  Samples: number;
  Species: string;
  Technology: string;
  Type: string;
  id: string;
}

export interface NODE {
  id: string;
  label: string;
  size?: number;
  font?: any;
  disease: string;
  borderWidth?: number;
  datasets: Array<DATASET> | string[];
}

export interface ConnectedNode extends EDGE {
  id?: string;
  node: string;
}

export interface GRAPH {
  edges: Array<EDGE>;
  nodes: Array<NODE>;
  diseases?: Array<string>;
}
