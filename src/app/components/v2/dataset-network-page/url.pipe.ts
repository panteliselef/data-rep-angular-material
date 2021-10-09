import { Pipe, PipeTransform } from '@angular/core';
import {SearchResult} from 'src/app/models/search.model';


@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  /**
   * Pipe for creating a valid url path for a search result
   */
  transform(result: SearchResult): string {
    if (result?.foundIn === 'technology') {
      return `/v2/dataset/${result.name}`;
    }else {
      return `/v2/dataset/${result.foundIn}/${result.name}`;
    }
  }

}
