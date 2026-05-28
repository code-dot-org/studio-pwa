/**
 * TTS wrapper using the Web Speech API.
 *
 * Exports:
 *   speak(text, lang)    — speaks text, cancelling any in-flight utterance.
 *   stop()               — cancels any in-flight utterance.
 *   isSupported(lang)    — returns true if a voice is available for lang.
 */

/** BCP-47 locale per Language code. */
const LOCALE: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

/** Speaks text in the given language, cancelling any in-flight utterance. */
export async function speak(text: string, lang: string): Promise<void> {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE[lang] ?? lang;
  window.speechSynthesis.speak(utterance);
}

/** Cancels any in-flight TTS utterance. */
export async function stop(): Promise<void> {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** Returns true if the platform has a TTS voice for the given language code. */
export async function isSupported(lang: string): Promise<boolean> {
  if (!('speechSynthesis' in window)) return false;
  const target = (LOCALE[lang] ?? lang).toLowerCase().slice(0, 2);
  return window.speechSynthesis
    .getVoices()
    .some(v => v.lang.toLowerCase().startsWith(target));
}
