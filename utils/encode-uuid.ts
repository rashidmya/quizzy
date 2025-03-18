import ShortUUID from "short-uuid";

const translator = ShortUUID();

export function encodeUUID(quizId: string): string {
  return translator.fromUUID(quizId);
}

export function decodeUUID(encodedId: string): string {
  return translator.toUUID(encodedId);
}
