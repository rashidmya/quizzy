// sections/dashboard/quiz/creation/utils/default-question.ts
import { QUESTION_TYPES } from "@/constants";

/**
 * Creates a default question template based on question type
 * @param type The type of question to create
 * @returns Default question object with appropriate structure for the given type
 */
export function createDefaultQuestion(type: (typeof QUESTION_TYPES)[number]) {
  switch (type) {
    case "multiple_choice":
      return {
        text: "What is the capital of France?",
        type: "multiple_choice" as const,
        timer: undefined,
        points: 1,
        choices: [
          { text: "Paris", isCorrect: true },
          { text: "London", isCorrect: false },
          { text: "Berlin", isCorrect: false },
          { text: "Madrid", isCorrect: false },
        ],
      };

    case "true_false":
      return {
        text: "The Earth is flat.",
        type: "true_false" as const,
        timer: undefined,
        points: 1,
        correctAnswer: false,
        explanation: "The Earth is approximately spherical in shape.",
      };

    case "fill_in_blank":
      return {
        text: "The largest planet in our solar system is _______.",
        type: "fill_in_blank" as const,
        timer: undefined,
        points: 1,
        correctAnswer: "Jupiter",
        acceptedAnswers: "jupiter,Jupiter,JUPITER",
      };

    case "open_ended":
      return {
        text: "Explain the process of photosynthesis.",
        type: "open_ended" as const,
        timer: undefined,
        points: 1,
        guidelines:
          "Answer should include light absorption, conversion to chemical energy, and production of oxygen.",
      };

    default:
      return createDefaultQuestion("multiple_choice");
  }
}
