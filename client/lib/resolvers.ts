import { zodResolver as _zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";

/**
 * Typed wrapper around @hookform/resolvers/zod that handles the Zod v4/v3
 * overload resolution issue when schemas are re-exported through barrel files.
 *
 * @hookform/resolvers@5.x supports both Zod v3 and v4, but TypeScript can't
 * always infer the correct overload through re-export chains. This wrapper
 * provides a unified interface that works with both versions.
 */
export function zodResolver<T extends FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaOptions?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolverOptions?: any,
): Resolver<T> {
  return _zodResolver(schema, schemaOptions, resolverOptions) as Resolver<T>;
}
