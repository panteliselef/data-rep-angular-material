export interface PostgresResponse {
  main_table?: (SearchResultStudy)[] | (PostgresStudy)[] | null;
  unique_studyid?: (string)[] | null;
  unique_disease?: (string)[] | null;
  unique_technologyid?: (string)[] | null;
  unique_specie?: (string)[] | null;
}

export interface SearchResultStudy {
  studyid: string;
  disease: string;
  technologyid: string;
  specie: string;
}

export interface PostgresStudy {
  studyid: string;
  samples: number;
  studytype: string;
  studytypedef: string;
}
