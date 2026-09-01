export abstract class Entity<T> {
  constructor(protected readonly props: T) {}

  protected getProps(): T {
    return this.props;
  }
}
