declare class Client<T> {
  constructor(engine: Client.Engine<T>);
  constructor(engine: { new (options?: Client.Options): Client.Engine<T> }, options?: Client.Options);

  /**
   * Terminates the connection to the cache server.
   */
  stop(): void;
  /**
   * Creates a connection to the cache server. Must be called before any other method is available.
   */
  start(callback: (err?: Error | null) => void): void;
  /**
   * Returns `true` if cache engine determines itself as ready, `false` if it is not ready.
   */
  isReady(): boolean;
  /**
   * Returns null if the segment name is valid, otherwise should return an instance of Error with an appropriate message.
   */
  validateSegmentName(name: string): Error | null;
  /**
   * Retrieve an item from the cache engine if found.
   */
  get(key: Client.Key, callback: (err: Error | null, result?: Client.Result<T> | null) => void): void;
  /**
   * Store an item in the cache for a specified length of time.
   */
  set(key: Client.Key, value: T, ttl: number, callback: (err?: Error | null) => void): void;
  /**
   * Remove an item from cache.
   */
  drop(key: Client.Key, callback: (err?: Error | null) => void): void;
}

declare namespace Client {
  /**
   * The strategy configuration object. Each strategy defines its own configuration options with common options.
   */
  export interface Options {
    /**
     * The partition name used to isolate the cached results across multiple clients. The partition name is used as the MongoDB database name, the Riak bucket, or as a key prefix in Redis and Memcached. To share the cache across multiple clients, use the same partition name.
     */
    partition?: string;
  }

  export interface Key {
    /**
     * A caching segment name string. Enables using a single cache server for storing different sets of items with overlapping ids.
     */
    segment: string;
    /**
     * A unique item identifier string (per segment). Can be an empty string.
     */
    id: string;
  }

  export interface Engine<T> {
    stop(): void;
    start(callback: (err?: Error | null) => void): void;
    isReady(): boolean;
    validateSegmentName(name: string): boolean;
    get(key: Client.Key, callback: (err: Error | null, result?: Client.Result<T> | null) => void): void;
    set(key: Client.Key, value: T, ttl: number, callback: (err?: Error | null) => void): void;
    drop(key: Client.Key, callback: (err?: Error | null) => void): void;
  }

  export interface Result<T> {
    item: T;
    stored: number;
    ttl: number;
  }
}

export = Client;
