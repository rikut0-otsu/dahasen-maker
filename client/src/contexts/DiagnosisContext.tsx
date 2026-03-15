import React, { createContext, useContext } from 'react';
import { useDiagnosis } from '@/hooks/useDiagnosis';

type DiagnosisContextType = ReturnType<typeof useDiagnosis>;

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(
  undefined
);

export const DiagnosisProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const diagnosis = useDiagnosis();

  return (
    <DiagnosisContext.Provider value={diagnosis}>
      {children}
    </DiagnosisContext.Provider>
  );
};

export const useDiagnosisContext = () => {
  const context = useContext(DiagnosisContext);
  if (!context) {
    throw new Error(
      'useDiagnosisContext must be used within DiagnosisProvider'
    );
  }
  return context;
};
