import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function jsonResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: string, status: number = 500, details?: unknown): NextResponse {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status });
}

export interface RouteHandlerOptions<TParams extends z.ZodType = z.ZodAny> {
  validate?: z.ZodType;
  handler: (data: TParams extends z.ZodType ? z.infer<TParams> : unknown, req: NextRequest) => Promise<NextResponse>;
}

/**
 * Create a POST route handler with automatic Zod validation and error handling.
 *
 * Usage:
 * ```ts
 * export const POST = createRouteHandler({
 *   validate: bodySchema,
 *   handler: async (data, req) => { ... return jsonResponse({ success: true }); }
 * });
 * ```
 */
export function createRouteHandler(options: RouteHandlerOptions) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse('Invalid JSON', 400);
    }

    if (options.validate) {
      const parsed = options.validate.safeParse(body);
      if (!parsed.success) {
        return errorResponse('Validation failed', 400, parsed.error.flatten());
      }
      body = parsed.data;
    }

    try {
      return await options.handler(body, req);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = (err as { statusCode?: number })?.statusCode ?? 500;
      return errorResponse(message, status);
    }
  };
}

/**
 * Create a GET route handler with query string validation.
 */
export function createGetHandler(options: {
  validate?: z.ZodType;
  handler: (data: unknown, req: NextRequest) => Promise<NextResponse>;
}) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let data: unknown = undefined;

    if (options.validate) {
      const url = new URL(req.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => { params[key] = value; });
      const parsed = options.validate.safeParse(params);
      if (!parsed.success) {
        return errorResponse('Validation failed', 400, parsed.error.flatten());
      }
      data = parsed.data;
    }

    try {
      return await options.handler(data, req);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      const status = (err as { statusCode?: number })?.statusCode ?? 500;
      return errorResponse(message, status);
    }
  };
}
