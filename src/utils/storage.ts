// import { adminService, Administrator } from '@/services/admin';

type StorageType = 'sessionStorage' | 'localStorage';

type StorageConfig<T extends Record<string, any>> = {
  prefix?: string;
  type?: StorageType;
  store?: Partial<T>;
};
type Callback<T> = (store: Partial<T>) => void;

class LocaleStorage<T extends Record<string, any> = Record<string, any>> {
  // readonly prefix: string = 'jagat-admin/';
  readonly type: StorageType = 'localStorage';
  readonly store: Partial<T> = {};
  private storage: Storage = window.localStorage;
  private callbacks: Callback<T>[] = [];
  private preversion = [`${window.location.origin}/utown-admin`, 'utown-admin'];
  constructor(config: StorageConfig<T> = {}) {
    const { prefix, type, store } = config;
    // if (typeof prefix === 'string') {
    //   this.pefix = prefix;
    // }
    if (type === 'sessionStorage') {
      this.type = type;
      this.storage = window.sessionStorage;
    }
    if (store) {
      this.store = store;
    }
    this.initStore(store);
  }
  private switchKey(key: string) {
    return key;
  }
  private names(data: Record<string, any>) {
    return Object.getOwnPropertyNames(data);
  }
  private runCallbacks() {
    this.callbacks.map((callback) => {
      callback({ ...this.store });
    });
  }
  private initStore(store?: Partial<T>) {
    if (this.preversion.length) {
      const reg = new RegExp(`^(${this.preversion.join('|')})`);
      Object.keys(localStorage).map((name) => {
        if (reg.test(name)) {
          this.storage.removeItem(name);
        }
      });
    }
    this.names(this.storage).map((name) => {
      if (name.startsWith(this.prefix)) {
        if (store) {
          this.storage.removeItem(name);
          const value = JSON.stringify(store[this.switchKey(name)]);
          if (value !== undefined) {
            this.storage.setItem(name, value);
            this.store[this.switchKey(name) as keyof T] =
              store[this.switchKey(name)];
          }
        } else {
          this.store[this.switchKey(name) as keyof T] = JSON.parse(
            this.storage[name],
          );
        }
      }
    });
  }
  setItems = (store: Partial<T>) => {
    const names = this.names(store);
    if (!names.length) return;
    names.map((name) => {
      const value = JSON.stringify(store[name]);
      const key = this.switchKey(name);
      if (value === undefined) {
        this.storage.removeItem(key);
        delete this.store[name];
      } else {
        this.storage.setItem(key, value);
        this.store[name as keyof T] = store[name];
      }
    });
    this.runCallbacks();
  };
  removeItems = (names: (keyof T)[]) => {
    names.map((name) => {
      this.storage.removeItem(this.switchKey(name as string));
      delete this.store[name];
    });
    if (names.length) {
      this.runCallbacks();
    }
  };
  clear = () => {
    this.names(this.storage).map((name) => {
      if (name.startsWith(this.prefix)) {
        this.storage.removeItem(name);
      }
    });
    this.names(this.store).map((name) => {
      delete this.store[name];
    });
    this.runCallbacks();
  };
  onStoreChange = (callback: Callback<T>, once?: boolean) => {
    const index = this.callbacks.findIndex((cb) => cb === callback);
    if (index === -1) {
      if (once) {
        const fn = (store: Partial<T>) => {
          callback(store);
          const index = this.callbacks.findIndex((cb) => cb === fn);
          if (index > -1) {
            this.callbacks.splice(index, 1);
          }
        };
        this.callbacks.push(fn);
      } else {
        this.callbacks.push(callback);
      }
    }
  };
  offStoreChange = (callback: Callback<T>) => {
    const index = this.callbacks.findIndex((cb) => cb === callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  };
}
interface AdminStorageStore {
  roles: string[];
  menus: string[];
  token: string;
  userName: string;
  userId: number;
  mapboxMapLang: string;
  sysNotificationUserIds?: string;
}

const session = new LocaleStorage<{ fcmUserIds?: string }>({
  type: 'sessionStorage',
});

export { LocaleStorage, session };
export type { AdminStorageStore };
