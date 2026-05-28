/**
 * useTts — speak a single text string via the Web Speech API.
 * Used for the language-picker pronunciation cue.
 */

/**
 * Speaks the given text in the specified locale.
 * Silent no-op if the Web Speech API is unavailable.
 */
export async function speak(text: string, locale: string): Promise<void> {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  window.speechSynthesis.speak(utterance);
}
