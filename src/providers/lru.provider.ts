// Code was 'borrowed' from https://stackoverflow.com/questions/996505/lru-cache-implementation-in-javascript and adopted to our needs, is using memory cache as it's Singleton pattern.

class LRU {
    max: number;
    cache: any;
    constructor(max = 10) {
      this.max = max;
      this.cache = new Map();
    }
  
    get(key: string): string {
      let item = this.cache.get(key);
      if (item) {
        // refresh key
        this.cache.delete(key);
        this.cache.set(key, item);
      }
      return item;
    }
  
    set(key: string, val: string): void {
      // refresh key
      if (this.cache.has(key)) this.cache.delete(key);
      // evict oldest
      else if (this.cache.size == this.max) this.cache.delete(this.first());
      this.cache.set(key, val);
    }
  
    first(): string {
      return this.cache.keys().next().value;
    }
}

export { LRU };