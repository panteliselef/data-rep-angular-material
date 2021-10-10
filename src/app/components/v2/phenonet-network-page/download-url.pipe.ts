import { Pipe, PipeTransform } from '@angular/core';
import {ApiService} from 'src/app/services/api.service';

type FileType = 'data' | 'annotation';
@Pipe({
  name: 'downloadUrl'
})
export class DownloadUrlPipe implements PipeTransform {

  transform(studies: string[], fileType: FileType = 'annotation'): string {
    return ApiService.getStudiesFilesURL(studies, fileType);
  }

}
