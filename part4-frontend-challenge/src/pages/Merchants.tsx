import { useState } from 'react';
import './Merchants.css';
import { MerchantForm } from '../components/merchants/MerchantForm';
import { MerchantList } from '../components/merchants/MerchantList';
import { MerchantDetails } from '../components/merchants/MerchantDetails';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Notification } from '../components/common/Notification';
import { Merchant, MerchantFormData } from '../types/merchant';

/**
 * Merchants Page Component
 * 
 * Main page for merchant management with full CRUD operations
 */
export const Merchants = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [viewingMerchant, setViewingMerchant] = useState<Merchant | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<MerchantFormData | null>(null);
  const [merchantToDelete, setMerchantToDelete] = useState<Merchant | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleCreateMerchant = async (data: MerchantFormData) => {
    try {
      const { createMerchant } = await import('../services/merchantService');
      await createMerchant(data);
      showNotification('Merchant created successfully!', 'success');
      setRefreshTrigger((prev) => prev + 1);
      setIsFormOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create merchant';
      showNotification(errorMessage, 'error');
      throw error;
    }
  };

  const handleEditMerchant = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setIsFormOpen(true);
  };

  const handleViewMerchant = (merchant: Merchant) => {
    setViewingMerchant(merchant);
  };

  const handleDeleteMerchant = (merchant: Merchant) => {
    setMerchantToDelete(merchant);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!merchantToDelete?.id) {
      setShowDeleteDialog(false);
      setMerchantToDelete(null);
      return;
    }

    try {
      const { deleteMerchant } = await import('../services/merchantService');
      await deleteMerchant(merchantToDelete.id);
      showNotification('Merchant deleted successfully!', 'success');
      setShowDeleteDialog(false);
      setMerchantToDelete(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete merchant';
      showNotification(errorMessage, 'error');
      setShowDeleteDialog(false);
      setMerchantToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setMerchantToDelete(null);
  };

  const handleUpdateMerchant = async (data: MerchantFormData) => {
    if (!editingMerchant?.id) {
      throw new Error('Merchant ID is required for update');
    }

    // Store the form data and show confirmation dialog
    // Don't close the form yet - wait for user confirmation
    setPendingFormData(data);
    setShowConfirmDialog(true);
    
    // Return resolved promise so form submission doesn't fail
    // The form will stay open until user confirms or cancels
    return Promise.resolve();
  };

  const confirmUpdate = async () => {
    if (!editingMerchant?.id || !pendingFormData) {
      setShowConfirmDialog(false);
      setPendingFormData(null);
      return;
    }

    try {
      const { updateMerchant } = await import('../services/merchantService');
      await updateMerchant(editingMerchant.id, pendingFormData);
      showNotification('Merchant updated successfully!', 'success');
      setShowConfirmDialog(false);
      setPendingFormData(null);
      setEditingMerchant(null);
      setIsFormOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update merchant';
      showNotification(errorMessage, 'error');
      setShowConfirmDialog(false);
      setPendingFormData(null);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingFormData(null);
    // Keep form open so user can make changes
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMerchant(null);
  };

  return (
    <main className="container">
      <div className="placeholder-page">
        <div className="placeholder-header">
          <h1>🏢 Merchants Management</h1>
          <p className="subtitle">Manage merchant accounts and settings</p>
        </div>

        {/* Merchant List Table with Create Button */}
        <div className="merchants-content-wrapper">
          <MerchantList 
            refreshTrigger={refreshTrigger} 
            onEdit={handleEditMerchant}
            onView={handleViewMerchant}
            onDelete={handleDeleteMerchant}
            onCreateClick={() => setIsFormOpen(true)}
          />
        </div>
      </div>

      {/* Merchant Form Modal */}
      <MerchantForm
        isOpen={isFormOpen}
        merchant={editingMerchant}
        onClose={handleFormClose}
        onSubmit={editingMerchant ? handleUpdateMerchant : handleCreateMerchant}
      />

      {/* Confirmation Dialog for Update */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Update"
        message="Are you sure you want to update this merchant's information?"
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={confirmUpdate}
        onCancel={cancelUpdate}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Merchant"
        message={`Are you sure you want to delete "${merchantToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Merchant Details Modal */}
      {viewingMerchant && (
        <MerchantDetails
          merchant={viewingMerchant}
          isOpen={!!viewingMerchant}
          onClose={() => setViewingMerchant(null)}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
};
