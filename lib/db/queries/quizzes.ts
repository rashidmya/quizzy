import {
  FillInBlankQuestion,
  MultipleChoiceQuestion,
  OpenEndedQuestion,
  TrueFalseQuestion,
} from "@/types/question";
import { db } from "../drizzle";
import {
  quizzes,
  questions,
  multipleChoiceDetails,
  users,
  quizAttempts,
  attemptAnswers,
  trueFalseDetails,
  fillInBlankDetails,
  openEndedDetails,
} from "../schema";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getQuizzes(userId: string) {
  return db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // Return createdBy as an object with id and name.
      createdBy: {
        id: users.id,
        name: users.name,
      },
      // Compute questionCount using a subquery.
      questionCount: sql<number>`CAST((SELECT COUNT(*) FROM questions WHERE questions.quiz_id = ${quizzes.id}) AS INTEGER)`,
      timer: quizzes.timer,
      timerMode: quizzes.timerMode,
      status: quizzes.status,
      shuffleQuestions: quizzes.shuffleQuestions,
      scheduledAt: quizzes.scheduledAt,
      endedAt: quizzes.endedAt,
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.createdBy, users.id))
    .where(eq(quizzes.createdBy, userId));
}

export async function getQuizzesWithReport(userId: string) {
  try {
    return db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt,
        participantCount: sql<number>`CAST((SELECT COUNT(*) FROM quiz_attempts WHERE quiz_attempts.quiz_id = ${quizzes.id}) AS INTEGER)`,

        // Calculate accuracy using CTEs to avoid nested aggregates
        accuracy: sql<number>`COALESCE(
          (WITH correct_answers AS (
            SELECT 
              qa.id as attempt_id,
              COUNT(aa.id) as total_answers,
              SUM(CASE WHEN mc.is_correct = true THEN 1 ELSE 0 END) as correct_count
            FROM quiz_attempts qa
            JOIN attempt_answers aa ON qa.id = aa.attempt_id
            JOIN ${multipleChoiceDetails} mc ON aa.answer = mc.text
            WHERE qa.quiz_id = ${quizzes.id}
            GROUP BY qa.id
          )
          SELECT CAST(
            (SUM(correct_count) * 100.0 / NULLIF(SUM(total_answers), 0))
          AS NUMERIC(5,1))
          FROM correct_answers), 0)`,

        // Calculate completion rate also avoiding nested aggregates
        completionRate: sql<number>`COALESCE(
          (WITH question_counts AS (
            SELECT COUNT(*) as total_questions
            FROM questions 
            WHERE questions.quiz_id = ${quizzes.id}
          ),
          attempt_counts AS (
            SELECT 
              COUNT(DISTINCT qa.id) as total_attempts,
              COUNT(aa.id) as total_answers
            FROM quiz_attempts qa
            LEFT JOIN attempt_answers aa ON qa.id = aa.attempt_id
            WHERE qa.quiz_id = ${quizzes.id}
          )
          SELECT CAST(
            (total_answers * 100.0 / NULLIF(total_attempts * total_questions, 0)) 
          AS NUMERIC(5,1))
          FROM attempt_counts, question_counts), 0)`,

        // Get the most recent attempt date
        lastAttempt: sql<Date>`(
          SELECT MAX(taken_at)
          FROM quiz_attempts
          WHERE quiz_attempts.quiz_id = ${quizzes.id} AND quiz_attempts.submitted = true
        )`,

        // Author information
        createdBy: {
          id: users.id,
          name: users.name,
        },

        status: quizzes.status,
        scheduledAt: quizzes.scheduledAt,
        endedAt: quizzes.endedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.createdBy, userId))
      .orderBy(desc(quizzes.createdAt));
  } catch (error) {
    console.error("Failed to fetch quizzes with report:", error);
    throw new Error("Failed to fetch quizzes with report");
  }
}

export async function getQuizWithQuestions(quizId: string) {
  try {
    const quizResult = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdBy: {
          id: users.id,
          name: users.name,
        },
        timer: quizzes.timer,
        timerMode: quizzes.timerMode,
        status: quizzes.status,
        shuffleQuestions: quizzes.shuffleQuestions,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        scheduledAt: quizzes.scheduledAt,
        endedAt: quizzes.endedAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.id, quizId));

    if (!quizResult.length) return null;
    const quiz = quizResult[0];

    // Get all questions for this quiz.
    const questionsResult = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // For each question, get its details based on its type.
    const questionsWithDetails = await Promise.all(
      questionsResult.map(async (question) => {
        switch (question.type) {
          case "multiple_choice": {
            const choices = await db
              .select()
              .from(multipleChoiceDetails)
              .where(eq(multipleChoiceDetails.questionId, question.id));
            return { ...question, choices } as MultipleChoiceQuestion;
          }
          case "true_false": {
            const details = await db
              .select()
              .from(trueFalseDetails)
              .where(eq(trueFalseDetails.questionId, question.id));
            return { ...question, ...details[0] } as TrueFalseQuestion;
          }
          case "fill_in_blank": {
            const details = await db
              .select()
              .from(fillInBlankDetails)
              .where(eq(fillInBlankDetails.questionId, question.id));
            return {
              ...question,
              ...details[0],
            } as FillInBlankQuestion;
          }
          case "open_ended": {
            const details = await db
              .select()
              .from(openEndedDetails)
              .where(eq(openEndedDetails.questionId, question.id));
            return { ...question, ...details[0] } as OpenEndedQuestion;
          }
          default:
            return {
              ...question,
              type: "multiple_choice", // Default to multiple choice
              choices: [], // Add required properties for multiple choice
            } as MultipleChoiceQuestion;
        }
      })
    );

    return { ...quiz, questions: questionsWithDetails };
  } catch (error) {
    console.error("Failed to fetch quiz with questions:", error);
    throw new Error("Failed to fetch quiz with questions");
  }
}

export async function getQuizAttemptsByQuizId(quizId: string) {
  try {
    // Get all attempts for this quiz
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId));

    // For each attempt, get the related answers
    const attemptsWithAnswers = await Promise.all(
      attempts.map(async (attempt) => {
        const answers = await db
          .select({
            id: attemptAnswers.id,
            attemptId: attemptAnswers.attemptId,
            questionId: attemptAnswers.questionId,
            answer: attemptAnswers.answer,
            updatedAt: attemptAnswers.updatedAt,
            questionPoints: questions.points,
            questionType: questions.type,
          })
          .from(attemptAnswers)
          .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
          .where(eq(attemptAnswers.attemptId, attempt.id));

        // For each answer, determine correctness based on question type.
        const answersWithCorrectness = await Promise.all(
          answers.map(async (answer) => {
            let isCorrect = false;
            if (answer.questionType === "multiple_choice") {
              // Answer is the choice ID. Check in multipleChoiceDetails.
              const mcDetail = await db
                .select()
                .from(multipleChoiceDetails)
                .where(
                  and(
                    sql`${multipleChoiceDetails.id} = ${answer.answer}::uuid`,
                    eq(multipleChoiceDetails.isCorrect, true)
                  )
                );
              isCorrect = mcDetail.length > 0;
            } else if (answer.questionType === "true_false") {
              // For true/false, fetch the trueFalseDetails row and compare.
              const tfDetail = await db
                .select({ correctAnswer: trueFalseDetails.correctAnswer })
                .from(trueFalseDetails)
                .where(eq(trueFalseDetails.questionId, answer.questionId));
              if (tfDetail.length > 0) {
                // Assume answer.answer is a string "true" or "false"
                isCorrect =
                  (tfDetail[0].correctAnswer === true &&
                    answer.answer === "true") ||
                  (tfDetail[0].correctAnswer === false &&
                    answer.answer === "false");
              }
            } else if (answer.questionType === "fill_in_blank") {
              // For fill-in-the-blank, compare answer with correct answer and accepted answers.
              const fibDetail = await db
                .select({
                  correctAnswer: fillInBlankDetails.correctAnswer,
                  acceptedAnswers: fillInBlankDetails.acceptedAnswers,
                })
                .from(fillInBlankDetails)
                .where(eq(fillInBlankDetails.questionId, answer.questionId));
              if (fibDetail.length > 0) {
                const detail = fibDetail[0];
                const acceptedAnswers = detail.acceptedAnswers
                  ? detail.acceptedAnswers
                      .split(",")
                      .map((a) => a.trim().toLowerCase())
                  : [];
                const given = answer.answer.trim().toLowerCase();
                isCorrect =
                  given === detail.correctAnswer.trim().toLowerCase() ||
                  acceptedAnswers.includes(given);
              }
            } else if (answer.questionType === "open_ended") {
              // Open-ended answers are typically manually graded; default to false.
              isCorrect = false;
            }
            return { ...answer, isCorrect };
          })
        );

        return { ...attempt, answers: answersWithCorrectness };
      })
    );

    return attemptsWithAnswers;
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    throw new Error("Failed to fetch quiz attempts");
  }
}

/**
 * Gets detailed report data for a specific quiz
 */
export async function getQuizReportDetails(quizId: string) {
  try {
    // Get quiz basic info
    const quizResult = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdBy: {
          id: users.id,
          name: users.name,
        },
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .innerJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.id, quizId));

    if (!quizResult.length) return null;
    const quiz = quizResult[0];

    // Get questions count
    const questionsCount = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(questions)
      .where(eq(questions.quizId, quizId))
      .then((res) => res[0].count);

    // Get all attempts
    const attempts = await db
      .select({
        id: quizAttempts.id,
        email: quizAttempts.email,
        startedAt: quizAttempts.startedAt,
        takenAt: quizAttempts.takenAt,
        submitted: quizAttempts.submitted,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId));

    // Get accuracy and questions data
    const allQuestions = await db
      .select({
        id: questions.id,
        text: questions.text,
        type: questions.type,
        points: questions.points,
      })
      .from(questions)
      .where(eq(questions.quizId, quizId));

    // For each question, get answer statistics
    const questionsWithStats = await Promise.all(
      allQuestions.map(async (question) => {
        // Count attempts for this question
        const answersCount = await db
          .select({
            count: sql<number>`COUNT(*)`,
          })
          .from(attemptAnswers)
          .innerJoin(
            quizAttempts,
            eq(attemptAnswers.attemptId, quizAttempts.id)
          )
          .where(
            and(
              eq(attemptAnswers.questionId, question.id),
              eq(quizAttempts.quizId, quizId)
            )
          )
          .then((res) => res[0].count);

        // For each question type, create an appropriate answer distribution
        let answerDistribution: {text: string; isCorrect: boolean; count: number}[] = [];
        
        if (question.type === "multiple_choice") {
          // Get all possible choices
          const choices = await db
            .select({
              id: multipleChoiceDetails.id,
              text: multipleChoiceDetails.text,
              isCorrect: multipleChoiceDetails.isCorrect,
            })
            .from(multipleChoiceDetails)
            .where(eq(multipleChoiceDetails.questionId, question.id));

          // For each choice, count how many selected it
          answerDistribution = await Promise.all(
            choices.map(async (choice) => {
              // Count answers where the answer field contains the choice ID
              const selectionCount = await db
                .select({
                  count: sql<number>`COUNT(*)`,
                })
                .from(attemptAnswers)
                .where(
                  and(
                    eq(attemptAnswers.questionId, question.id),
                    sql`${attemptAnswers.answer}::uuid = ${choice.id}`
                  )
                )
                .then((res) => res[0].count);

              return {
                text: choice.text,
                isCorrect: choice.isCorrect,
                count: selectionCount,
              };
            })
          );
        } 
        else if (question.type === "true_false") {
          // For true/false questions, count true and false answers
          const tfDetails = await db
            .select({ correctAnswer: trueFalseDetails.correctAnswer })
            .from(trueFalseDetails)
            .where(eq(trueFalseDetails.questionId, question.id))
            .then(res => res[0]);
            
          // Count true answers
          const trueCount = await db
            .select({
              count: sql<number>`COUNT(*)`,
            })
            .from(attemptAnswers)
            .where(
              and(
                eq(attemptAnswers.questionId, question.id),
                sql`LOWER(${attemptAnswers.answer}) = 'true'`
              )
            )
            .then((res) => res[0].count);
            
          // Count false answers
          const falseCount = await db
            .select({
              count: sql<number>`COUNT(*)`,
            })
            .from(attemptAnswers)
            .where(
              and(
                eq(attemptAnswers.questionId, question.id),
                sql`LOWER(${attemptAnswers.answer}) = 'false'`
              )
            )
            .then((res) => res[0].count);
            
          // Create answer distribution
          answerDistribution = [
            {
              text: "True",
              isCorrect: tfDetails?.correctAnswer === true,
              count: trueCount,
            },
            {
              text: "False",
              isCorrect: tfDetails?.correctAnswer === false,
              count: falseCount,
            }
          ];
        }
        else if (question.type === "fill_in_blank") {
          // For fill-in-blank, show frequency of different answers
          const fibDetails = await db
            .select({ 
              correctAnswer: fillInBlankDetails.correctAnswer,
              acceptedAnswers: fillInBlankDetails.acceptedAnswers
            })
            .from(fillInBlankDetails)
            .where(eq(fillInBlankDetails.questionId, question.id))
            .then(res => res[0]);
          
          // Get all answers for this question
          const allAnswers = await db
            .select({
              answer: attemptAnswers.answer
            })
            .from(attemptAnswers)
            .where(eq(attemptAnswers.questionId, question.id));
            
          if (allAnswers.length > 0) {
            // Group answers by frequency
            const answerFrequency: Record<string, number> = {};
            allAnswers.forEach(a => {
              const answerLower = a.answer.toLowerCase();
              answerFrequency[answerLower] = (answerFrequency[answerLower] || 0) + 1;
            });
            
            // Determine which answers are correct
            const acceptedAnswersSet = new Set<string>();
            if (fibDetails) {
              acceptedAnswersSet.add(fibDetails.correctAnswer.toLowerCase());
              if (fibDetails.acceptedAnswers) {
                fibDetails.acceptedAnswers.split(',')
                  .map(a => a.trim().toLowerCase())
                  .forEach(a => acceptedAnswersSet.add(a));
              }
            }
            
            // Convert to answer distribution format, sorted by frequency
            answerDistribution = Object.entries(answerFrequency)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10) // Limit to top 10 answers to avoid huge lists
              .map(([answer, count]) => ({
                text: answer,
                isCorrect: acceptedAnswersSet.has(answer),
                count
              }));
          }
        }
        // For open-ended, we don't show answer distribution
        
        // Calculate accuracy based on question type
        let accuracy = 0;
        
        if (question.type === "multiple_choice") {
          // For multiple choice, calculate percentage of correct answers
          accuracy = await db
            .select({
              accuracy: sql<number>`
              CAST(
                SUM(CASE 
                  WHEN ${multipleChoiceDetails.isCorrect} = true THEN 1 
                  ELSE 0 
                END) * 100.0 / NULLIF(COUNT(*), 0)
              AS NUMERIC(5,1))
            `,
            })
            .from(attemptAnswers)
            .innerJoin(
              multipleChoiceDetails,
              sql`${attemptAnswers.answer}::uuid = ${multipleChoiceDetails.id}`
            )
            .where(eq(attemptAnswers.questionId, question.id))
            .then((res) => res[0]?.accuracy || 0);
        } 
        else if (question.type === "true_false") {
          // For true/false, compare answer boolean with correct answer
          const tfDetails = await db
            .select({ correctAnswer: trueFalseDetails.correctAnswer })
            .from(trueFalseDetails)
            .where(eq(trueFalseDetails.questionId, question.id))
            .then(res => res[0]);
          
          if (tfDetails) {
            const correctAnswerStr = tfDetails.correctAnswer ? "true" : "false";
            
            accuracy = await db
              .select({
                accuracy: sql<number>`
                CAST(
                  SUM(CASE 
                    WHEN LOWER(${attemptAnswers.answer}) = ${correctAnswerStr} THEN 1 
                    ELSE 0 
                  END) * 100.0 / NULLIF(COUNT(*), 0)
                AS NUMERIC(5,1))
              `,
              })
              .from(attemptAnswers)
              .where(eq(attemptAnswers.questionId, question.id))
              .then((res) => res[0]?.accuracy || 0);
          }
        }
        else if (question.type === "fill_in_blank") {
          // For fill-in-blank, check against accepted answers
          const fibDetails = await db
            .select({ 
              correctAnswer: fillInBlankDetails.correctAnswer,
              acceptedAnswers: fillInBlankDetails.acceptedAnswers
            })
            .from(fillInBlankDetails)
            .where(eq(fillInBlankDetails.questionId, question.id))
            .then(res => res[0]);
          
          if (fibDetails) {
            // Get all answers for this question
            const allAnswers = await db
              .select({
                answer: attemptAnswers.answer
              })
              .from(attemptAnswers)
              .where(eq(attemptAnswers.questionId, question.id));
            
            if (allAnswers.length > 0) {
              // Count correct answers
              let correctCount = 0;
              const correctAnswerLower = fibDetails.correctAnswer.toLowerCase();
              
              // Set of accepted answers
              const acceptedAnswersSet = new Set([correctAnswerLower]);
              if (fibDetails.acceptedAnswers) {
                fibDetails.acceptedAnswers.split(',')
                  .map(a => a.trim().toLowerCase())
                  .forEach(a => acceptedAnswersSet.add(a));
              }
              
              // Count how many answers are correct
              allAnswers.forEach(a => {
                if (acceptedAnswersSet.has(a.answer.toLowerCase())) {
                  correctCount++;
                }
              });
              
              // Calculate accuracy
              accuracy = (correctCount * 100.0) / allAnswers.length;
            }
          }
        }
        // For open-ended, we don't calculate accuracy automatically
        
        return {
          ...question,
          answersCount,
          answerDistribution,
          accuracy
        };
      })
    );

    // Calculate overall stats
    const totalPoints = allQuestions.reduce(
      (sum, question) => sum + question.points,
      0
    );
    
    const totalParticipants = attempts.length;

    // Calculate overall accuracy from participant scores
    // For each participant, calculate their score and accuracy
    const participantsWithScores = await Promise.all(
      attempts.map(async (attempt) => {
        const answers = await db
          .select({
            questionId: attemptAnswers.questionId,
            answer: attemptAnswers.answer,
          })
          .from(attemptAnswers)
          .where(eq(attemptAnswers.attemptId, attempt.id));

        // Calculate the score for this participant
        let score = 0;
        let attemptedQuestions = 0;
        
        // Process each answer
        for (const answer of answers) {
          const question = allQuestions.find(q => q.id === answer.questionId);
          if (!question) continue;
          
          // Count every answer record as an attempted question, regardless of content
          attemptedQuestions++;

          // Handle scoring based on question type
          if (question.type === "multiple_choice") {
            // Check if the selected answer is correct using the answer as choice ID
            try {
              const isCorrect = await db
                .select({ isCorrect: multipleChoiceDetails.isCorrect })
                .from(multipleChoiceDetails)
                .where(sql`${multipleChoiceDetails.id} = ${answer.answer}::uuid`) // Cast answer to UUID
                .then(res => res[0]?.isCorrect || false);

              if (isCorrect) {
                score += question.points;
              }
            } catch (error) {
              console.error(`Error checking answer correctness: ${error}`);
              // Continue with next answer even if this one fails
            }
          } else if (question.type === "true_false") {
            // For true/false questions
            try {
              const tfDetails = await db
                .select({ correctAnswer: trueFalseDetails.correctAnswer })
                .from(trueFalseDetails)
                .where(eq(trueFalseDetails.questionId, question.id))
                .then(res => res[0]);
              
              // Compare answer (stored as "true" or "false" string) with the correct boolean value
              const answerBool = answer.answer.toLowerCase() === "true";
              if (tfDetails && tfDetails.correctAnswer === answerBool) {
                score += question.points;
              }
            } catch (error) {
              console.error(`Error checking true/false answer: ${error}`);
            }
          } else if (question.type === "fill_in_blank") {
            // For fill-in-the-blank questions
            try {
              const fibDetails = await db
                .select({ 
                  correctAnswer: fillInBlankDetails.correctAnswer,
                  acceptedAnswers: fillInBlankDetails.acceptedAnswers
                })
                .from(fillInBlankDetails)
                .where(eq(fillInBlankDetails.questionId, question.id))
                .then(res => res[0]);
              
              if (fibDetails) {
                // Check if answer matches the correct answer exactly
                if (answer.answer.toLowerCase() === fibDetails.correctAnswer.toLowerCase()) {
                  score += question.points;
                } 
                // Check if answer is among the accepted alternatives
                else if (fibDetails.acceptedAnswers) {
                  const alternatives = fibDetails.acceptedAnswers.split(',').map(a => a.trim().toLowerCase());
                  if (alternatives.includes(answer.answer.toLowerCase())) {
                    score += question.points;
                  }
                }
              }
            } catch (error) {
              console.error(`Error checking fill-in-blank answer: ${error}`);
            }
          }
          // For open-ended questions, no automatic scoring is done
        }

        return {
          id: attempt.id,
          email: attempt.email,
          score: score,
          accuracy: totalPoints > 0 ? (score / totalPoints) * 100 : 0,
          attemptedQuestions: attemptedQuestions,
        };
      })
    );

    // Calculate overall accuracy and completion rate
    const totalPossiblePoints = totalPoints * totalParticipants;
    const totalScoredPoints = participantsWithScores.reduce(
      (sum, p) => sum + p.score,
      0
    );
    
    const overallAccuracy = 
      totalPossiblePoints > 0 
        ? (totalScoredPoints / totalPossiblePoints) * 100 
        : 0;

    const totalQuestionsAttempted = participantsWithScores.reduce(
      (sum, p) => sum + p.attemptedQuestions,
      0
    );
    
    const completionRate =
      totalParticipants * questionsCount > 0
        ? (totalQuestionsAttempted / (totalParticipants * questionsCount)) * 100
        : 0;

    return {
      quiz,
      stats: {
        accuracy: overallAccuracy,
        completionRate,
        totalParticipants,
        totalQuestions: questionsCount,
        totalPoints
      },
      participants: participantsWithScores,
      questions: questionsWithStats,
    };
  } catch (error) {
    console.error("Failed to fetch quiz report details:", error);
    throw new Error("Failed to fetch quiz report details");
  }
}

/**
 * Retrieves all answers for a particular attempt.
 */
export async function getAttemptAnswers(attemptId: string) {
  if (!attemptId?.trim()) {
    throw new Error("Attempt ID is required");
  }

  try {
    // Get all answers for this attempt with question text for better context
    const answersData = await db
      .select({
        id: attemptAnswers.id,
        questionId: attemptAnswers.questionId,
        answer: attemptAnswers.answer,
        updatedAt: attemptAnswers.updatedAt,
        questionText: questions.text,
        questionType: questions.type
      })
      .from(attemptAnswers)
      .leftJoin(questions, eq(attemptAnswers.questionId, questions.id))
      .where(eq(attemptAnswers.attemptId, attemptId));

    // Process each answer to add readable answer text
    const mappedAnswers = await Promise.all(answersData.map(async (a) => {
      const answer: {
        questionId: string;
        answer: string;
        updatedAt?: Date;
        questionText?: string;
        answerText?: string;
        questionType?: string;
        isCorrect: boolean;
      } = {
        questionId: a.questionId as string,
        answer: a.answer,
        updatedAt: a.updatedAt,
        questionText: a.questionText || undefined,
        questionType: a.questionType || undefined,
        isCorrect: false
      };

      // If it's a multiple choice question, get the text of the selected choice
      if (a.questionType === "multiple_choice" && a.answer) {
        try {
          // Try to find the choice text using the answer ID (UUID)
          const choiceData = await db
            .select({
              text: multipleChoiceDetails.text,
              isCorrect: multipleChoiceDetails.isCorrect
            })
            .from(multipleChoiceDetails)
            .where(sql`${multipleChoiceDetails.id} = ${a.answer}::uuid`)
            .then(rows => rows[0]);

          if (choiceData) {
            answer.answerText = choiceData.text;
            answer.isCorrect = choiceData.isCorrect;
          } else {
            answer.answerText = "Unknown choice";
            answer.isCorrect = false;
          }
        } catch (error) {
          console.error(`Error getting choice text: ${error}`);
          answer.answerText = "Error retrieving choice";
          answer.isCorrect = false;
        }
      } else if (a.questionType === "true_false") {
        answer.answerText = a.answer; // Already human-readable
        
        // Check if the answer is correct
        try {
          const tfDetails = await db
            .select({ correctAnswer: trueFalseDetails.correctAnswer })
            .from(trueFalseDetails)
            .where(eq(trueFalseDetails.questionId, a.questionId))
            .then(res => res[0]);
          
          if (tfDetails) {
            const answerBool = a.answer.toLowerCase() === "true";
            answer.isCorrect = tfDetails.correctAnswer === answerBool;
          }
        } catch (error) {
          console.error(`Error checking true/false correctness: ${error}`);
        }
      } else if (a.questionType === "fill_in_blank") {
        answer.answerText = a.answer; // Already human-readable
        
        // Check if the answer is correct
        try {
          const fibDetails = await db
            .select({ 
              correctAnswer: fillInBlankDetails.correctAnswer,
              acceptedAnswers: fillInBlankDetails.acceptedAnswers
            })
            .from(fillInBlankDetails)
            .where(eq(fillInBlankDetails.questionId, a.questionId))
            .then(res => res[0]);
          
          if (fibDetails) {
            const userAnswer = a.answer.toLowerCase();
            const correctAnswer = fibDetails.correctAnswer.toLowerCase();
            
            // Check exact match
            if (userAnswer === correctAnswer) {
              answer.isCorrect = true;
            } 
            // Check alternative accepted answers
            else if (fibDetails.acceptedAnswers) {
              const alternatives = fibDetails.acceptedAnswers
                .split(',')
                .map(alt => alt.trim().toLowerCase());
              
              if (alternatives.includes(userAnswer)) {
                answer.isCorrect = true;
              }
            }
          }
        } catch (error) {
          console.error(`Error checking fill-in-blank correctness: ${error}`);
        }
      } else if (a.questionType === "open_ended") {
        answer.answerText = a.answer; // Already human-readable
      }

      return answer;
    }));

    return mappedAnswers;
  } catch (error) {
    console.error("Error fetching attempt answers:", error);
    throw new Error("Failed to fetch attempt answers");
  }
}
