export class EnvService {
  private static _env: any;

  static get env(): any {
    if (!this._env) {
      const browserWindow: any = window || {};
      this._env = browserWindow['__env'] || {};
    }
    return this._env;
  }

  static get production(): boolean {
    return this.env.production || false;
  }

  static get apiURL(): string {
    return this.env.apiURL || '';
  }

  static get clientId(): string {
    return this.env.clientId || '';
  }

  static get tenantId(): string {
    return this.env.tenantId || '';
  }

  static get tokenClientId(): string {
    return this.env.tokenClientId || '';
  }

  static get accessScope(): string {
    return this.env.accessScope || '';
  }

  static get redirectURI(): string {
    return this.env.redirectURI || '';
  }
}
