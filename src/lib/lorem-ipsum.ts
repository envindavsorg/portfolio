type GenerationUnit = "words" | "sentences" | "paragraphs";

const LOREM_WORDS = [
  "ad",
  "adipisicing",
  "aliqua",
  "aliquip",
  "amet",
  "anim",
  "aute",
  "cillum",
  "commodo",
  "consectetur",
  "consequat",
  "culpa",
  "cupidatat",
  "deserunt",
  "do",
  "dolor",
  "dolore",
  "duis",
  "ea",
  "eiusmod",
  "elit",
  "enim",
  "esse",
  "est",
  "et",
  "eu",
  "ex",
  "excepteur",
  "exercitation",
  "fugiat",
  "id",
  "in",
  "incididunt",
  "ipsum",
  "irure",
  "labore",
  "laboris",
  "laborum",
  "lorem",
  "magna",
  "minim",
  "mollit",
  "nisi",
  "non",
  "nostrud",
  "nulla",
  "occaecat",
  "officia",
  "pariatur",
  "proident",
  "qui",
  "quis",
  "reprehenderit",
  "sint",
  "sed",
  "sit",
  "sunt",
  "tempor",
  "ullamco",
  "ut",
  "velit",
  "veniam",
  "voluptate",
] as const;

const STANDARD_SENTENCE =
  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

const capitalizeFirstLetter = (sentence: string): string =>
  sentence.charAt(0).toUpperCase() + sentence.slice(1);

const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomWords = (amount: number): string =>
  Array.from(
    { length: amount },
    () => LOREM_WORDS[randomBetween(0, LOREM_WORDS.length - 1)]
  ).join(" ");

const generateSentence = (useStandard: boolean): string =>
  useStandard
    ? STANDARD_SENTENCE
    : capitalizeFirstLetter(randomWords(randomBetween(7, 14)));

const generateSentences = (
  amount: number,
  startWithStandard: boolean
): string => {
  const sentences = Array.from({ length: amount }, (_, i) =>
    generateSentence(startWithStandard && i === 0)
  );
  return `${sentences.join(". ")}.`;
};

const generateParagraphs = (
  amount: number,
  startWithStandard: boolean,
  asHTML: boolean
): string =>
  Array.from({ length: amount }, (_, i) => {
    const paragraph = generateSentences(
      randomBetween(3, 6),
      startWithStandard && i === 0
    );
    return asHTML ? `<p>${paragraph}</p>` : paragraph;
  }).join("\n\n");

export const generateLoremIpsum = ({
  generationUnit = "paragraphs",
  inputAmount = 1,
  startWithStandard = true,
  asHTML = false,
}: {
  generationUnit?: GenerationUnit;
  inputAmount?: number;
  startWithStandard?: boolean;
  asHTML?: boolean;
} = {}): string => {
  if (inputAmount < 1 || inputAmount > 99) {
    return "Invalid input: Please enter a number between 1 and 99.";
  }

  const generators: Record<GenerationUnit, () => string> = {
    paragraphs: () =>
      generateParagraphs(inputAmount, startWithStandard, asHTML),
    sentences: () =>
      generateSentences(inputAmount, startWithStandard),
    words: () => randomWords(inputAmount),
  };

  const text = generators[generationUnit]();
  return asHTML && generationUnit !== "paragraphs"
    ? `<p>${text}</p>`
    : text;
};
