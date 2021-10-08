
/*
  * Auto generated with https://jvilk.com/MakeTypes/
 */

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
  _source: DiseaseEdge|PlatformEdge|GeneData;
}

export interface PlatformEdge {
  node2: PlatformNode;
  platform_id: string;
  q_value: number;
  node1: PlatformNode;
}
export interface PlatformNode {
  disease: string;
  data_table_id: string;
}

export interface DiseaseEdge {
  node2: DiseaseNode;
  corr_data_table_conn?: ((string)[] | null)[] | null;
  node1: DiseaseNode;
  frequency: number;
}
export interface DiseaseNode {
  disease: string;
  corr_data_table_ids?: (string)[] | null;
}

export interface GeneData {
  node2: DiseaseNode;
  thres2000?: (string)[] | null;
  thres500?: (string)[] | null;
  platform_id: string;
  thres100?: (string)[] | null;
  q_value: number;
  thres1000?: (string)[] | null;
  node1: DiseaseNode;
}

