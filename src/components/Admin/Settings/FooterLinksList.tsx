import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { FooterLinkForm } from './FooterLinkForm';

interface FooterLink {
  id: string;
  section_name: string;
  link_text: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
  opens_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export const FooterLinksList: React.FC = () => {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/settings/footer-links');
      
      if (response.success) {
        setLinks(response.data);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to fetch footer links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this footer link?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/admin/settings/footer-links/${id}`);
      
      if (response.success) {
        showSuccess('Footer link deleted successfully');
        fetchLinks();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to delete footer link');
    }
  };

  const handleEdit = (link: FooterLink) => {
    setEditingLink(link);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLink(null);
    fetchLinks();
  };

  const toggleActive = async (link: FooterLink) => {
    try {
      const response = await apiClient.put(`/admin/settings/footer-links/${link.id}`, {
        is_active: !link.is_active
      });
      
      if (response.success) {
        showSuccess(`Footer link ${!link.is_active ? 'activated' : 'deactivated'}`);
        fetchLinks();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update footer link');
    }
  };

  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.section_name]) {
      acc[link.section_name] = [];
    }
    acc[link.section_name].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Footer Links</h2>
          <p className="text-sm text-gray-600 mt-1">Manage footer navigation links</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Link
        </button>
      </div>

      {/* Grouped Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedLinks).map(([section, items]) => (
          <div key={section} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{section}</h3>
                <span className="text-sm text-gray-500">({items.length})</span>
              </div>
            </div>

            {/* Links */}
            <div className="divide-y divide-gray-200">
              {items
                .sort((a, b) => a.display_order - b.display_order)
                .map((link) => (
                  <div
                    key={link.id}
                    className={`p-4 transition-all ${
                      link.is_active ? '' : 'opacity-60 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{link.link_text}</h4>
                          {link.opens_new_tab && (
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{link.link_url}</p>
                      </div>
                      <button
                        onClick={() => toggleActive(link)}
                        className={`p-1 rounded transition-colors ${
                          link.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {link.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(link)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Footer Links</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first footer link</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Link
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <FooterLinkForm
          link={editingLink}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

