import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IFlipbookWebPartProps } from '../../models/IFlipbookWebPartProps';

export interface IFlipbookAppProps extends Omit<IFlipbookWebPartProps, 'title'> {
  context: WebPartContext;
}
