export default class SequenceGenerator {
  private _count = -1;

  public nextString(): string {
    this._count++;
    return '' + this._count;
  }
}
