export class TransformerNotFoundError extends Error {
  public static withType(type: string) {
    return new TransformerNotFoundError(`Missed ${type} event map transformer`);
  }
}
