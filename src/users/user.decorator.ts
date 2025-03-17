import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User as UserDto } from './entities/user.entity';

interface RequestWithUser extends Request {
  user: UserDto;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
