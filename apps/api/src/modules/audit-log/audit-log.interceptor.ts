import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { LOG_ACTION_KEY } from '../../common/decorators/log-action.decorator';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logActionMeta = this.reflector.get(LOG_ACTION_KEY, context.getHandler());

    if (!logActionMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    return next.handle().pipe(
      tap((response) => {
        const entityId =
          response?.id || request.params?.id || request.params?.userId;

        this.auditLogService.create({
          userId: user?.id,
          userEmail: user?.email,
          action: logActionMeta.action,
          entity: logActionMeta.entity,
          entityId,
          metadata: {
            method: request.method,
            path: request.path,
            body: request.method === 'POST' ? this.sanitizeBody(request.body) : undefined,
          },
          ipAddress: request.ip,
        });
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }
}
