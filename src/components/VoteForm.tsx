import React, { useState } from 'react';
import Button from './Button';

interface VoteFormProps {
  projectId: number;
  projectName: string;
  projectPresenter: string;
  projectDescription: string;
  onSubmit: (data: { 
    projectId: number;
    communicationScore: number; 
    businessScore: number; 
    creativityScore: number;     
    finalScore: number;
    comment: string 
  }) => void;
  onCancel: () => void;
}

const ScoreSelector = ({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-gray-700 font-medium">{label}</label>
        <span className="text-blue-600 font-semibold">{value}</span>
      </div>
      <p className="text-gray-500 text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreValue) => (
          <button
            key={scoreValue}
            type="button"
            onClick={() => onChange(scoreValue)}
            className={`h-10 w-10 rounded-full text-center flex items-center justify-center 
              ${value === scoreValue 
                ? 'bg-blue-600 text-white font-bold' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {scoreValue}
          </button>
        ))}
      </div>
    </div>
  );
};

const VoteForm = ({ 
  projectId, 
  projectName, 
  projectPresenter, 
  projectDescription, 
  onSubmit, 
  onCancel 
}: VoteFormProps) => {
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [businessScore, setBusinessScore] = useState<number>(5);
  const [creativityScore, setCreativityScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  
  // Calcula a média com uma casa decimal para exibição
  const displayAverageScore = Math.round(((communicationScore + businessScore + creativityScore) / 3) * 10) / 10;
  
  // Calcula a nota final como um número inteiro para o banco de dados
  const finalScore = Math.round((communicationScore + businessScore + creativityScore) / 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({ 
      projectId,
      communicationScore, 
      businessScore, 
      creativityScore,
      finalScore, 
      comment 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Avaliar projeto: {projectName}</h3>
        <p className="text-gray-600 mb-2"><span className="font-medium">Apresentador:</span> {projectPresenter}</p>
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
          <p className="text-gray-600 whitespace-pre-line">{projectDescription}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h4 className="text-lg font-medium mb-4">Critérios de Avaliação</h4>
          
          <ScoreSelector
            label="Capacidade de Comunicação"
            description="Avalie a clareza, organização e eficácia da apresentação"
            value={communicationScore}
            onChange={setCommunicationScore}
          />
          
          <ScoreSelector
            label="Conhecimento do Negócio"
            description="Avalie o entendimento do problema e do mercado"
            value={businessScore}
            onChange={setBusinessScore}
          />
          
          <ScoreSelector
            label="Criatividade"
            description="Avalie a originalidade e inovação da solução proposta"
            value={creativityScore}
            onChange={setCreativityScore}
          />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md flex justify-between items-center">
            <span className="font-medium text-blue-800">Nota Final:</span>
            <span className="text-2xl font-bold text-blue-700">{displayAverageScore}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Comentário (opcional):
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Deixe um comentário sobre o projeto..."
          />
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" variant="primary" fullWidth>
            Confirmar Voto
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VoteForm;