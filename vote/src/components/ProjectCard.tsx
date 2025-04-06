import React from 'react';
import Button from './Button';

interface Project {
  id: number;
  title: string;
  description: string;
  presenter: string;
}

interface ProjectCardProps {
  project: Project;
  onVote: (projectId: number) => void;
  isSelected?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onVote, isSelected = false }) => {
  const { id, title, description, presenter } = project;

  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-sm ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-2">Apresentado por: {presenter}</p>
      <p className="text-gray-700 mb-4">{description}</p>
      <Button 
        onClick={() => onVote(id)} 
        variant={isSelected ? 'primary' : 'secondary'}
      >
        {isSelected ? 'Selecionado' : 'Votar neste projeto'}
      </Button>
    </div>
  );
};

export default ProjectCard; 