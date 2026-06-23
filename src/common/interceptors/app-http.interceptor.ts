import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from 'src/modules/users/entities/user.entity';
import * as uuid from 'uuid';

function getUserFromJwt(token: string): Partial<User> | null {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    );
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      userName: payload.userName,
    };
  } catch {
    return null;
  }
}

function extractUserFromRequest(
  user: Partial<User> | null,
  _remoteAddress: string,
): User | undefined {
  if (!user) return undefined;
  return user as User;
}

@Injectable()
export class AppHttpInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AppHttpInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { connection, method, protocol, originalUrl, body } = request;

    let user: User | undefined;
    const authHeader = request.headers['authorization'];

    if (authHeader) {
      const [, token] = authHeader.split(' ');
      user = getUserFromJwt(token) as User;
      user = extractUserFromRequest(user, connection.remoteAddress);
    }

    const now = Date.now();
    const url = `${protocol}://${request.get('host')}${originalUrl}`;
    const requestId = uuid.v4();

    let logMessage = `[36mUserName = [37m [37m${
      user?.userName ?? 'anonymous'
    } [36mFullNames = [37m${user?.userName ?? 'anonymous'} [36mEvent = [37m${
      context.getClass().name
    }. [37m${context.getHandler().name} [36mRequestUrl = [37m${method} [37m${url} [36mIpAddress= [37m${
      request?.body?.origin ?? connection.remoteAddress
    } [36mUserAgent = [37m${userAgent}`;

    const log = (isError: boolean, error?: any) => {
      let stringifiedPayload;
      const payload = body;
      try {
        stringifiedPayload = JSON.stringify(payload);
      } catch (e) {}
      if (stringifiedPayload && stringifiedPayload !== '') {
        logMessage += ` [36mPayload = [37m${stringifiedPayload} [36mRequestId = [37m${requestId}`;
      }
      this.logger.log(
        `${logMessage} [36mResponseTime = [37m${Date.now() - now}ms`,
      );

      if (isError) {
        this.logger.error(error.stack);
      }
      this.logger.debug(
        `--------------------------------------------------------------------------------------------------------------------------------------------------------`,
      );
    };
    return next.handle().pipe(
      tap({
        next: () => {
          log(false);
          context.switchToHttp().getResponse();
        },
        error: (err) => {
          log(true, err);
        },
      }),
    );
  }
}
