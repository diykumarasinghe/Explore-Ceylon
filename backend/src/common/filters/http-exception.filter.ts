import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error).message || 'Internal server error' };

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof errorResponse === 'object' ? errorResponse : { message: errorResponse }),
    };

    response.status(status).json(responseBody);
  }
}
