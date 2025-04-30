
import { useState } from 'react';

export interface Guideline {
  dos: string;
  donts: string;
}

export interface GuidelineData {
  dos: string[];
  donts: string[];
}

export const useAgentGuidelines = (initialGuidelines: Guideline[] = [{ dos: '', donts: '' }]) => {
  const [guidelines, setGuidelines] = useState<Guideline[]>(initialGuidelines);

  const addGuideline = () => {
    setGuidelines([...guidelines, { dos: '', donts: '' }]);
  };

  const removeGuideline = (index: number) => {
    const newGuidelines = [...guidelines];
    newGuidelines.splice(index, 1);
    setGuidelines(newGuidelines);
  };

  const updateGuideline = (index: number, field: keyof Guideline, value: string) => {
    const newGuidelines = [...guidelines];
    newGuidelines[index] = { ...newGuidelines[index], [field]: value };
    setGuidelines(newGuidelines);
  };

  const formatGuidelinesForApi = (): GuidelineData => {
    return {
      dos: guidelines.map(g => g.dos).filter(text => text.trim() !== ''),
      donts: guidelines.map(g => g.donts).filter(text => text.trim() !== '')
    };
  };

  return {
    guidelines,
    setGuidelines,
    addGuideline,
    removeGuideline,
    updateGuideline,
    formatGuidelinesForApi
  };
};

export default useAgentGuidelines;
