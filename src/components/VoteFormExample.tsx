import { useState } from 'react';
import VoteForm from './VoteForm';
import { submitVote } from '@/lib/api';

interface VoteFormExampleProps {
  project: {
    id: number;
    title: string;
    presenter: string;
    description: string;
  };
  onVoteComplete?: () => void;
}

export default function VoteFormExample({ project, onVoteComplete }: VoteFormExampleProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: {
    projectId: number;
    communicationScore: number;
    businessScore: number;
    creativityScore: number;
    finalScore: number;
    comment: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Enviar dados para a API
      await submitVote(data);
      
      setSuccess(true);
      if (onVoteComplete) {
        onVoteComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar voto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Implementar lu00f3gica de cancelamento
    if (onVoteComplete) {
      onVoteComplete();
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200 text-center">
        <h3 className="text-xl font-semibold text-green-700 mb-2">Voto registrado com sucesso!</h3>
        <p className="text-green-600 mb-4">Obrigado por avaliar este projeto.</p>
        {onVoteComplete && (
          <button 
            onClick={onVoteComplete}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Voltar
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 p-4 mb-4 rounded-md border border-red-200 text-red-700">
          {error}
        </div>
      )}
      
      <VoteForm
        projectId={project.id}
        projectName={project.title}
        projectPresenter={project.presenter}
        projectDescription={project.description}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg font-medium">Enviando voto...</p>
          </div>
        </div>
      )}
    </div>
  );
}