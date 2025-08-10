import React, { useState } from 'react';
import { GeneratorList } from './GeneratorList';
import { GeneratorForm } from './GeneratorForm';
import { Generator } from '../../types/api';

export const Generators: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingGenerator, setEditingGenerator] = useState<Generator | undefined>();

  const handleAdd = () => {
    setEditingGenerator(undefined);
    setShowForm(true);
  };

  const handleEdit = (generator: Generator) => {
    setEditingGenerator(generator);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingGenerator(undefined);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingGenerator(undefined);
    // The list will refresh automatically
  };

  return (
    <>
      <GeneratorList onAdd={handleAdd} onEdit={handleEdit} />
      {showForm && (
        <GeneratorForm
          generator={editingGenerator}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </>
  );
};