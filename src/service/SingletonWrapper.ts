type Ctor<C> = new (...args: any[]) => C;

export default class SingletonWrapper<T> {
  private static instances = new Map<Ctor<any>, any>();

  private constructor(public readonly clazz: Ctor<T>,
                      private readonly args: any[]) {
    if (!SingletonWrapper.isClassRegistered(clazz)) {
      SingletonWrapper.instances.set(clazz, null);
    }
  }

  public static create<C>(ctor: Ctor<C>, ...args: any[]): SingletonWrapper<C> {
    const wrapper = new SingletonWrapper<C>(ctor, args);
    wrapper.instantiate();
    return wrapper;
  }

  public static lazyWrap<C>(ctor: Ctor<C>, ...args: any[]): SingletonWrapper<C> {
    return new SingletonWrapper<C>(ctor, args);
  }

  public static isClassRegistered<C>(ctor: Ctor<C>): boolean {
    return this.instances.has(ctor);
  }

  public static hasInstance<C>(ctor: Ctor<C>): boolean {
    return !! this.instances.get(ctor);
  }

  public get(): T {
    if (! SingletonWrapper.hasInstance(this.clazz)) {
      this.instantiate();
    }
    return SingletonWrapper.instances.get(this.clazz);
  }

  private instantiate(): void {
    const instance = new this.clazz(...this.args);
    SingletonWrapper.instances.set(this.clazz, instance);
  }
}
