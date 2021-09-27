export interface ElasticModel {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
}
export interface Shards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}
export interface Hits {
  total: Total;
  max_score: number;
  hits?: (HitsEntity)[] | null;
}
export interface Total {
  value: number;
  relation: string;
}
export interface HitsEntity {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Source;
}
export interface Source {
  node2: PhenonetNode;
  corr_data_table_conn?: ((string)[] | null)[] | null;
  node1: PhenonetNode;
  frequency: number;
}
export interface PhenonetNode {
  disease: string;
  corr_data_table_ids?: (string)[] | null;
}
