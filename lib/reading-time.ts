const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const SENTENCE_PATTERN = /[.!?]+(?=\s|$)/g;

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

function decodeHtmlEntities(value: string) {
  return Object.entries(HTML_ENTITY_MAP).reduce(
    (text, [entity, replacement]) => text.replaceAll(entity, replacement),
    value,
  );
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractTextFromHtml(html: string) {
  if (!html) {
    return '';
  }

  const withoutNonTextBlocks = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ');

  const withSpaces = withoutNonTextBlocks
    .replace(/<\/(p|div|section|article|aside|header|footer|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');

  const stripped = withSpaces.replace(/<[^>]+>/g, ' ');
  return normalizeWhitespace(decodeHtmlEntities(stripped));
}

export function getTextStatistics(text: string) {
  const normalizedText = normalizeWhitespace(text);
  const words = normalizedText.match(WORD_PATTERN) ?? [];
  const wordCount = words.length;

  if (!normalizedText) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      wordsPerSentence: 0,
    };
  }

  const sentenceMatches = normalizedText.match(SENTENCE_PATTERN);
  const sentenceCount = Math.max(
    sentenceMatches?.length ?? 0,
    wordCount > 0 ? 1 : 0,
  );

  return {
    wordCount,
    sentenceCount,
    wordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
  };
}

function getImagePenaltySeconds(imageCount: number) {
  let total = 0;

  for (let index = 0; index < imageCount; index += 1) {
    total += Math.max(3, 12 - index);
  }

  return total;
}

export function estimateReadingTime(input: { text?: string; html?: string }) {
  const html = input.html ?? '';
  const text = normalizeWhitespace(input.text ?? extractTextFromHtml(html));
  const { wordCount } = getTextStatistics(text);
  const imageCount = (html.match(/<img\b/gi) ?? []).length;
  const codeBlockCount = (html.match(/<pre\b/gi) ?? []).length;

  const wordSeconds = (wordCount / 225) * 60;
  const imageSeconds = getImagePenaltySeconds(imageCount);
  const codeSeconds = codeBlockCount * 18;
  const totalSeconds = wordSeconds + imageSeconds + codeSeconds;
  const minutes =
    wordCount === 0 && imageCount === 0 && codeBlockCount === 0
      ? 0
      : Math.max(1, Math.ceil(totalSeconds / 60));

  return {
    minutes,
    wordCount,
    imageCount,
    codeBlockCount,
  };
}
