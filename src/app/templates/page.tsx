'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TemplateModal from '@/components/templates/TemplateModale';
import BasicButton from '@/components/general/BasicButton';


interface Template {
    createdAt: string;
    updatedAt: string;
    id: string;
    uid: string;
    title: string;
    description: string;
    templateContent: string;
}

export default function Templates() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const { status } = useSession();

    // Redirect to sign-in if the session is not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    // Fetch templates on session update
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('/api/templates');
                const { listTemplates } = await response.json();
                if (listTemplates) {
                    setTemplates(listTemplates);
                } else {
                    setTemplates([]);
                }
            } catch (error) {
                console.error('Error getting templates:', error);
            }
        };

        fetchTemplates();
    }, [isModalOpen]);

    // Open edit modal
    const openModal = (template: Template | null) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Templates</h1>
                    <BasicButton
                        onClick={() => openModal(null)} // Open the create modal
                        buttonText="Create New"
                        iconName="Plus" // Pass the icon name as a string
                        type="general"
                    />
                </div>

                <div className="space-y-6">
                    {templates.map((template: Template | null) => (
                        <div key={template?.id} className="bg-white shadow-md rounded-3xl p-6 hover:shadow-lg transition-shadow
                        border-1 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{template?.title}</h2>
                            <p className="text-gray-600 mb-4">{template?.description}</p>
                            <BasicButton
                                onClick={() => openModal(template)} // Open the edit modal
                                buttonText="Edit"
                                iconName="Edit" // Pass the icon name as a string
                                type="general"
                            />
                        </div>
                    ))}
                </div>
                {isModalOpen && <TemplateModal template={selectedTemplate} closeModal={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
}
