import { useState, useCallback } from 'react';
import questionsData from '@/data/questions.json';
import typesData from '@/data/types.json';

export interface Answer {
  questionId: number;
  score: number; // 2 or 1
  isPositive: boolean; // positiveな回答かnegativeな回答か
}

export interface DiagnosisState {
  currentPage: number; // 1-4
  answers: Answer[];
  result: (typeof typesData)[0] | null;
}

export interface AxisScores {
  speed: number;
  scope: number;
  logic: number;
  style: number;
}

export interface AxisResult {
  speed: 'fast' | 'careful';
  scope: 'broad' | 'deep';
  logic: 'logic' | 'intuition';
  style: 'solo' | 'support';
}

export const useDiagnosis = () => {
  const [state, setState] = useState<DiagnosisState>({
    currentPage: 1,
    answers: [],
    result: null,
  });

  const getQuestionsForPage = useCallback((page: number) => {
    const startIndex = (page - 1) * 4;
    return questionsData.slice(startIndex, startIndex + 4);
  }, []);

  const answerQuestion = useCallback((questionId: number, score: 2 | 1, isPositive: boolean) => {
    setState((prev) => {
      const existingAnswerIndex = prev.answers.findIndex(
        (a) => a.questionId === questionId
      );

      let newAnswers: Answer[];
      if (existingAnswerIndex >= 0) {
        newAnswers = [...prev.answers];
        newAnswers[existingAnswerIndex] = { questionId, score, isPositive };
      } else {
        newAnswers = [...prev.answers, { questionId, score, isPositive }];
      }

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, 4),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  }, []);

  const calculateResult = useCallback((): AxisResult => {
    const scores: AxisScores = {
      speed: 0,
      scope: 0,
      logic: 0,
      style: 0,
    };

    // スコアを集計
    state.answers.forEach((answer) => {
      const question = questionsData.find((q) => q.id === answer.questionId);
      if (!question) return;

      const axis = question.axis as keyof AxisScores;

      // positiveな回答の場合、そのスコアを加算
      // negativeな回答の場合も、スコアを加算（軸の反対側に投票）
      scores[axis] += answer.score;
    });

    // 各軸でスコアが高い方を採用
    // スコアの中央値は 16 (8問 × 平均2点)
    const result: AxisResult = {
      speed: scores.speed >= 8 ? 'fast' : 'careful',
      scope: scores.scope >= 8 ? 'broad' : 'deep',
      logic: scores.logic >= 8 ? 'logic' : 'intuition',
      style: scores.style >= 8 ? 'solo' : 'support',
    };

    return result;
  }, [state.answers]);

  const submitDiagnosis = useCallback(() => {
    const axisResult = calculateResult();
    const typeId = `${axisResult.speed}_${axisResult.scope}_${axisResult.logic}_${axisResult.style}`;
    const resultType = typesData.find((t) => t.id === typeId);

    if (resultType) {
      setState((prev) => ({
        ...prev,
        result: resultType,
      }));
    }
  }, [calculateResult]);

  const reset = useCallback(() => {
    setState({
      currentPage: 1,
      answers: [],
      result: null,
    });
  }, []);

  const getAnswerForQuestion = useCallback(
    (questionId: number) => {
      return state.answers.find((a) => a.questionId === questionId);
    },
    [state.answers]
  );

  return {
    state,
    getQuestionsForPage,
    answerQuestion,
    nextPage,
    prevPage,
    submitDiagnosis,
    reset,
    getAnswerForQuestion,
    calculateResult,
  };
};
