import { Pipe, PipeTransform } from '@angular/core';
import {SEARCH_RESULT} from 'src/app/models/search.model';

@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  transform(result: SEARCH_RESULT): string {
    if (result?.foundIn === 'technology') {
      return `/v2/dataset/${result.name}`;
    }else {
      return `/v2/dataset/${result.foundIn}/${result.name}`;
    }
  }

}
