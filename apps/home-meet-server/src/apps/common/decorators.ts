import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './constants';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
