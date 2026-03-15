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

export interface IndicatorScores {
  logic: number;
  emotion: number;
  drive: number;
  support: number;
  expansion: number;
  mastery: number;
  agile: number;
  precision: number;
}

export interface AxisResult {
  decision: 'logic' | 'emotion';
  role: 'drive' | 'support';
  domain: 'expansion' | 'mastery';
  execution: 'agile' | 'precision';
}

const typeIdByDefinition: Record<string, string> = {
  'logic_drive_expansion_agile': 'fast_broad_logic_solo',
  'logic_drive_expansion_precision': 'careful_broad_logic_solo',
  'logic_drive_mastery_agile': 'fast_deep_logic_solo',
  'logic_drive_mastery_precision': 'careful_deep_logic_solo',
  'logic_support_expansion_agile': 'fast_broad_logic_support',
  'logic_support_expansion_precision': 'careful_broad_logic_support',
  'logic_support_mastery_agile': 'fast_deep_logic_support',
  'logic_support_mastery_precision': 'careful_deep_logic_support',
  'emotion_drive_expansion_agile': 'fast_broad_intuition_solo',
  'emotion_drive_expansion_precision': 'careful_broad_intuition_solo',
  'emotion_drive_mastery_agile': 'fast_deep_intuition_solo',
  'emotion_drive_mastery_precision': 'careful_deep_intuition_solo',
  'emotion_support_expansion_agile': 'fast_broad_intuition_support',
  'emotion_support_expansion_precision': 'careful_broad_intuition_support',
  'emotion_support_mastery_agile': 'fast_deep_intuition_support',
  'emotion_support_mastery_precision': 'careful_deep_intuition_support',
};

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

  const calculateIndicatorScores = useCallback((): IndicatorScores => {
    const scores: IndicatorScores = {
      logic: 0,
      emotion: 0,
      drive: 0,
      support: 0,
      expansion: 0,
      mastery: 0,
      agile: 0,
      precision: 0,
    };

    state.answers.forEach((answer) => {
      const question = questionsData.find((q) => q.id === answer.questionId);
      if (!question) return;

      const selectedIndicator = (answer.isPositive
        ? question.positive
        : question.negative) as keyof IndicatorScores;
      const weightedScore = answer.score * (question.weight ?? 1);

      scores[selectedIndicator] += weightedScore;
    });

    return scores;
  }, [state.answers]);

  const calculateResult = useCallback((): AxisResult => {
    const scores = calculateIndicatorScores();

    const result: AxisResult = {
      decision: scores.logic >= scores.emotion ? 'logic' : 'emotion',
      role: scores.drive >= scores.support ? 'drive' : 'support',
      domain: scores.expansion >= scores.mastery ? 'expansion' : 'mastery',
      execution: scores.agile >= scores.precision ? 'agile' : 'precision',
    };

    return result;
  }, [calculateIndicatorScores]);

  const submitDiagnosis = useCallback(() => {
    const axisResult = calculateResult();
    const typeKey = `${axisResult.decision}_${axisResult.role}_${axisResult.domain}_${axisResult.execution}`;
    const typeId = typeIdByDefinition[typeKey];
    const resultType = typesData.find((t) => t.id === typeId);

    if (resultType) {
      setState((prev) => ({
        ...prev,
        result: resultType,
      }));
    }

    return resultType ?? null;
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
    calculateIndicatorScores,
    calculateResult,
  };
};
