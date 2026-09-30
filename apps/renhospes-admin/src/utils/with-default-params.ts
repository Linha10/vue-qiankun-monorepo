export function withDefaultParams<T extends object, D extends Partial<T> = Record<never, never>>(
  defaults: D
) {
  return function <R>(requestFn: (fullParams: T) => R) {
    return function (params: Omit<T, keyof D> & Partial<D>): R {
      const fullParams = { ...defaults, ...params } as unknown as T
      return requestFn(fullParams)
    }
  }
}
