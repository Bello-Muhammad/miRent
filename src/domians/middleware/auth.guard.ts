import { Injectable, CanActivate, ExecutionContext, SetMetadata, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT'
}

const ROLES_KEY = 'roles'; // the key Reflector will look up

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: user not authenticated');
    }

    const userRoles = Array.isArray(user.role)
      ? user.role
      : user.role ? [user.role] : [];

    if (userRoles.length === 0) {
      throw new ForbiddenException('Access denied: no roles found on user');
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
