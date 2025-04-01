// sections/(quiz)/quiz-taking/hooks/use-question-order.tsx
import { useState, useEffect } from 'react';
import {  QuestionUnion } from '@/types/question';

/**
 * Hook to manage question ordering and shuffling
 */
export function useQuestionOrder(
  questions: Array<QuestionUnion>,
  shouldShuffle: boolean,
  isReady: boolean
) {
  const [displayOrder, setDisplayOrder] = useState<number[]>([]);

  useEffect(() => {
    if (isReady) {
      if (shouldShuffle) {
        // Create an array of indices and shuffle it
        const indices = Array.from(
          { length: questions.length },
          (_, i) => i
        );
        setDisplayOrder(shuffleArray(indices));
      } else {
        // Use sequential order
        setDisplayOrder(
          Array.from({ length: questions.length }, (_, i) => i)
        );
      }
    }
  }, [questions.length, shouldShuffle, isReady]);

  // Compute ordered questions based on display order
  const orderedQuestions = displayOrder.map((index) => questions[index]);

  return { displayOrder, orderedQuestions };
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}