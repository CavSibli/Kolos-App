export class PasswordHash {
  private constructor(private readonly value: string) {}

  static fromHash(value: string): PasswordHash {
    if (!value) {
      throw new Error('Password hash cannot be empty');
    }
    return new PasswordHash(value);
  }

  toString(): string {
    return this.value;
  }
}
