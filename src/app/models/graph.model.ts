import {IdType} from 'vis';

export type DATASET_PAIRS = [{ dA: string, dB: string }];

export interface EDGE {
  from: string;
  to: string;
  value: number;
  weight: number;
  datasetPairs: DATASET_PAIRS;
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
  size: number;
  font: any;
  disease: string;
  borderWidth: number;
  datasets: Array<DATASET>;
}

export interface ConnectedNode extends EDGE {
  id?: string;
  node: string | IdType;
}

export interface GRAPH {
  edges: Array<EDGE>;
  nodes: Array<NODE>;
}
