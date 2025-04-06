import React, { useState } from 'react';
import Button from './Button';

interface VoteFormProps {
  projectId: number;
  projectName: string;
  onSubmit: (data: { score: number; comment: string }) => void;
  onCancel: () => void;
}

const VoteForm: React.FC<VoteFormProps> = ({ projectName, onSubmit, onCancel }) => {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ score, comment });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-8">Avaliar projeto: {projectName}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">        
          <div className="flex flex-wrap gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                className={`h-10 w-10 rounded-full text-center flex items-center justify-center 
                  ${score === value 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="text-center font-semibold mt-2 text-blue-600 text-lg">
            Nota selecionada: {score}
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