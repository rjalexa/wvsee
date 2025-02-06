'use client';

import { useEffect, useRef, useState } from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  collectionName: string;
}

export function DeleteModal({ isOpen, onClose, onDelete, collectionName }: DeleteModalProps) {
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleDelete = () => {
    if (inputValue === collectionName) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md font-bold">
            DANGER WARNING
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-700 mb-4">
          You are about to delete the collection &quot;{collectionName}&quot;. This action cannot be undone.
        </p>

        <div className="mb-4">
          <label htmlFor="confirmInput" className="block text-sm font-medium text-gray-700 mb-1">
            To activate delete type in the collection name:
          </label>
          <input
            ref={inputRef}
            id="confirmInput"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={inputValue !== collectionName}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            inputValue === collectionName
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          DANGER DELETE
        </button>
      </div>
    </div>
  );
}
