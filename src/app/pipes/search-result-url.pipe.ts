import { Pipe, PipeTransform } from '@angular/core';
import {SearchResult} from 'src/app/models/search.model';

@Pipe({
  name: 'searchResultUrl'
})
export class SearchResultUrlPipe implements PipeTransform {
  /**
   * Pipe for creating a valid url path for a search result
   */
  transform(result: SearchResult): string {
    switch (result?.foundIn) {
      case 'phenonet': return `/v2/phenonet/${result.name}`;
      case 'technology': return `/v2/dataset/${result.name}`;
      default: return `/v2/dataset/${result.foundIn}/${result.name}`;
    }
  }

}
