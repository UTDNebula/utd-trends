type KeyAsString<T> = Extract<keyof T, string>;

type IndexValueAsString<T extends Record<string, unknown>> =
  T[KeyAsString<T>] extends string ? T[KeyAsString<T>] : string;

interface FilterSearchParamsOptions<K, V> {
  onAppend?: (name: K, value: V) => void;
  onDelete?: (name: K, value?: V) => void;
  onSet?: (name: K, value: V) => void;
}

/**
 * Wrapper class for {@linkcode URLSearchParams} that adds type safety to
 * methods and a constructor that accepts callback functions for when
 * {@linkcode append}, {@linkcode delete}, or {@linkcode set} are used.
 */
export class FilterSearchParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends URLSearchParams {
  private options: FilterSearchParamsOptions<
    KeyAsString<T>,
    IndexValueAsString<T>
  > = {};

  constructor(
    init:
      | string
      | URLSearchParams
      | string[][]
      | Record<keyof T, string>
      | undefined,
    options?: FilterSearchParamsOptions<KeyAsString<T>, IndexValueAsString<T>>,
  ) {
    super(init);
    if (options) this.options = options;
  }

  append<
    K extends KeyAsString<T>,
    V extends T[K] extends string ? T[K] : string,
  >(name: K, value: V): void {
    super.append(name, value);
    this.options.onAppend?.(name, value);
  }

  delete<
    K extends KeyAsString<T>,
    V extends T[K] extends string ? T[K] : string,
  >(name: K, value?: V): void {
    super.delete(name, value);
    this.options.onDelete?.(name, value);
  }

  get(name: KeyAsString<T>): string | null {
    return super.get(name);
  }

  getAll(name: KeyAsString<T>): string[] {
    return super.getAll(name);
  }

  has<K extends KeyAsString<T>, V extends T[K] extends string ? T[K] : string>(
    name: K,
    value?: V,
  ): boolean {
    return super.has(name, value);
  }

  set<K extends KeyAsString<T>, V extends T[K] extends string ? T[K] : string>(
    name: K,
    value: V,
  ): void {
    super.set(name, value);
    this.options.onSet?.(name, value);
  }
}
