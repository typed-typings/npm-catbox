import Client = require('./client');

declare class Policy<T> {
  /**
   * Cache statistics.
   */
  stats: Policy.Stats;

  /**
   * @param cache a `Client` instance (which has already been started).
   * @param segment required when `cache` is provided. The segment name used to isolate cached items within the cache partition.
   */
  constructor(options?: Policy.Options<T>);
  constructor(options: Policy.Options<T> | undefined, cache: Client<T>, segment: string);

  /**
   * Retrieve an item from the cache. If the item is not found and the generateFunc method was provided, a new value is generated, stored in the cache, and returned. Multiple concurrent requests are queued and processed once.
   *
   * @param id the unique item identifier (within the policy segment). Can be a string or an object with the required 'id' key.
   * @param err any errors encountered
   * @param value the fetched or generated value
   * @param cached `null` if a valid item was not found in the cache, or an object
   * @param report an object with logging information about the generation operation
   */
  get(id: string | { id: string }, callback: (err: Error | null, value: T | null, cached: Policy.Cached<T> | null, report: Policy.Report) => void): void;
  /**
   * Store an item in the cache.
   *
   * @param id the unique item identifier (within the policy segment).
   * @param value the string or object value to be stored.
   * @param ttl a time-to-live **override** value in milliseconds after which the item is automatically removed from the cache (or is marked invalid). This should be set to `0` in order to use the caching rules configured when creating the `Policy` object.
   */
  set(id: string | { id: string }, value: T, ttl: number, callback: (err?: Error | null) => void): void;
  /**
   * Remove the item from cache.
   *
   * @param id the unique item identifier (within the policy segment).
   */
  drop(id: string | { id: string }, callback?: (err?: Error | null) => void): void;
  /**
   * Given a `created` timestamp in milliseconds, returns the time-to-live left based on the configured rules.
   */
  ttl(created: number): number;
  /**
   * Changes the policy rules after construction (note that items already stored will not be affected).
   */
  rules(options: Policy.Options<T>): void;
  /**
   * Returns `true` if cache engine determines itself as ready, `false` if it is not ready or if there is no cache engine set.
   */
  isReady(): boolean;
}

declare namespace Policy {
  export interface Stats {
    /**
     * Number of cache writes.
     */
    sets: number;
    /**
     * Number of cache `get()` requests.
     */
    gets: number;
    /**
     * Number of cache `get()` requests in which the requested id was found in the cache (can be stale).
     */
    hits: number;
    /**
     * Number of cache reads with stale requests (only counts the first request in a queued `get()` operation).
     */
    stales: number;
    /**
     * Number of calls to the generate function.
     */
    generates: number;
    /**
     * Cache operations errors.
     */
    errors: number;
  }

  export interface Cached<T> {
    /**
     * The cached `value`.
     */
    item: T;
    /**
     * The timestamp when the item was stored in the cache.
     */
    stored: number;
    /**
     * The cache ttl value for the record.
     */
    ttl: number;
    /**
     * `true` if the item is stale.
     */
    isStale: boolean;
  }

  export interface Report {
    /**
     * The cache lookup time in milliseconds.
     */
    msec: number;
    /**
     * The timestamp when the item was stored in the cache.
     */
    stored: number;
    /**
     * `true` if the item is stale.
     */
    isStale: boolean;
    /**
     * The cache ttl value for the record.
     */
    ttl: number;
    /**
     * Lookup error.
     */
    error: Error | null;
  }

  export interface Options<T> {
    /**
     * Relative expiration expressed in the number of milliseconds since the item was saved in the cache. Cannot be used together with `expiresAt`.
     */
    expiresIn?: number;
    /**
     * Time of day expressed in 24h notation using the 'HH:MM' format, at which point all cache records for the route expire. Uses local time. Cannot be used together with `expiresIn`.
     */
    expiresAt?: string;
    /**
     * A function used to generate a new cache item if one is not found in the cache when calling `get()`.
     */
    generateFunc?: (id: string | Client.Key, next: (err: Error | null, value: T, ttl: number) => void) => void;
    /**
     * Number of milliseconds to mark an item stored in cache as stale and attempt to regenerate it when `generateFunc` is provided. Must be less than `expiresIn`. Alternatively function that returns staleIn value in milliseconds.
     *
     * @param stored the timestamp when the item was stored in the cache (in milliseconds).
     * @param ttl the remaining time-to-live (not the original value used when storing the object).
     */
    staleIn?: number | ((stored: number, ttl: number) => number);
    /**
     * Number of milliseconds to wait before returning a stale value while generateFunc is generating a fresh value.
     */
    staleTimeout?: number;
    /**
     * Number of milliseconds to wait before returning a timeout error when the `generateFunc` function takes too long to return a value. When the value is eventually returned, it is stored in the cache for future requests. Required if `generateFunc` is present. Set to `false` to disable timeouts which may cause all `get()` requests to get stuck forever.
     */
    generateTimeout?: number;
    /**
     * If `true`, an error or timeout in the `generateFunc` causes the stale value to be evicted from the cache. Defaults to `true`.
     */
    dropOnError?: boolean;
    /**
     * If `false`, an upstream cache read error will stop the `get()` method from calling the generate function and will instead pass back the cache error. Defaults to `true`.
     */
    generateOnReadError?: boolean;
    /**
     * If `false`, an upstream cache write error will be passed back with the generated value when calling the `get()` method. Defaults to `true`.
     */
    generateIgnoreWriteError?: boolean;
    /**
     * Number of milliseconds while `generateFunc` call is in progress for a given id, before a subsequent `generateFunc` call is allowed. Defaults to `0`, no blocking of concurrent `generateFunc` calls beyond staleTimeout.
     */
    pendingGenerateTimeout?: number;
  }
}

export = Policy;
