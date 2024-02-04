class DependencyInjector {
  private static instance: DependencyInjector;
  private dependencies: any = {};

  private constructor() {}

  public static getInstance(): DependencyInjector {
    if (!DependencyInjector.instance) {
      DependencyInjector.instance = new DependencyInjector();
    }
    return DependencyInjector.instance;
  }

  public inject(key: string, dependency: any) {
    this.dependencies[key] = dependency;
  }

  public resolve(key: string) {
    if (!this.dependencies[key]) {
      throw new Error(`Dependency ${key} not found`);
    }
    return this.dependencies[key];
  }
}

export const DIContainer = DependencyInjector.getInstance();
