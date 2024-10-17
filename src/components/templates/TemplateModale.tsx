'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import BasicButton from '@/components/general/BasicButton'; // Assuming BasicButton is located in this path

interface Template {
  createdAt: string;
  updatedAt: string;
  id: string;
  uid: string;
  title: string;
  description: string;
  templateContent: string;
}

interface TemplateModalProps {
  template: Template | null;
  closeModal: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, closeModal }) => {
  const [id] = useState(template ? template.id : '');
  const [title, setTitle] = useState(template ? template.title : '');
  const [description, setDescription] = useState(template ? template.description : '');
  const [templateContent, setTemplateContent] = useState(template ? template.templateContent : '');

  const isSaveDisabled = !title || !templateContent;

  async function saveTemplate() {
    try {
      const method = template ? 'PUT' : 'POST';
      const response = await fetch('/api/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          description,
          templateContent
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${template ? 'update' : 'create'} template`);
      }

      console.log("Template saved successfully");
      closeModal();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }

  async function deleteTemplate() {
    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      console.log("Template deleted successfully");
      closeModal();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl relative w-full max-w-lg">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
          {template ? "Modify Template" : "Create Template"}
        </h2>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-transparent rounded-md p-3 w-full mb-4 focus:ring-2 focus:ring-primary focus:outline-none text-gray-800 dark:text-white"
          placeholder="Title"
        />

        {/* Description Input */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-transparent rounded-md p-3 w-full mb-4 focus:ring-2 focus:ring-primary focus:outline-none text-gray-800 dark:text-white"
          placeholder="Description"
        />

        {/* Template Content Input */}
        <input
          type="text"
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-transparent rounded-md p-3 w-full mb-6 focus:ring-2 focus:ring-primary focus:outline-none text-gray-800 dark:text-white"
          placeholder="Template"
        />

        {/* Button Section */}
        <div className="flex justify-between">
          {/* Save Button */}
          <BasicButton
            onClick={saveTemplate}
            buttonText="Save"
            iconName="Save"
            type="general" // Use button style based on web design
            disabled={isSaveDisabled}
          />

          {/* Delete Button */}
          {template && (
            <BasicButton
              onClick={deleteTemplate}
              buttonText="Delete"
              iconName="Trash2"
              type="delete" // Use delete button style based on web design
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
