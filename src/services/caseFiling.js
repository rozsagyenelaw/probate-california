import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Saves the court case number and hearing details. The server moves the case to the next phase
// the first time a case number is entered (clients cannot change the phase themselves).
export async function saveCaseFiling({ caseId, caseNumber, hearing }) {
  const res = await httpsCallable(functions, 'saveCaseFiling')({ caseId, caseNumber: caseNumber || null, hearing: hearing || null });
  return res.data;
}
