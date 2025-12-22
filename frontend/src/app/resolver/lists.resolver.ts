import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GlobalService } from '../services/global.service';

export const listsResolver: ResolveFn<boolean> = (route, state) => {
  return inject(GlobalService).observeList();
};
