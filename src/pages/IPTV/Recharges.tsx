import { useState, useCallback, useEffect, memo } from 'react';
import { useRecharges, useRechargeActions, usePlateformes } from '../../hooks/useApi';
import { formatCurrency, formatDate, getPaymentStatusColor } from '../../utils/helpers';
import { Recharge } from '../../types/database';
import Badge from '../../components/ui/badge/Badge';

// Tab types
type TabType = 'add' | 'history';

interface TabButtonProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (tab: TabType) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'border-b-2 border-green-500 text-green-500'
        : 'text-gray-400 hover:text-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Add Credits Form Component
interface AddCreditsFormProps {
  onSuccess: () => void;
}

const AddCreditsForm: React.FC<AddCreditsFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    id_plateforme: '',
    montant: '',
    statut: 'Payé',
    date_recharge: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const { data: plateformesData } = usePlateformes();
  const plateformes = plateformesData?.items || [];
  const { createRecharge } = useRechargeActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_plateforme || !formData.montant) return;

    setLoading(true);
    try {
      await createRecharge({
        id_plateforme: parseInt(formData.id_plateforme),
        montant: parseFloat(formData.montant),
        statut: formData.statut as 'Payé' | 'En attente',
        date_recharge: formData.date_recharge,
        notes: formData.notes || undefined
      });

      setFormData({
        id_plateforme: '',
        montant: '',
        statut: 'Payé',
        date_recharge: new Date().toISOString().slice(0, 16),
        notes: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating recharge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-500 rounded-lg p-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Add Credits</h2>
          <p className="text-gray-400 text-sm">Add credits to platform balance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Platform *
          </label>
          <select
            value={formData.id_plateforme}
            onChange={(e) => setFormData({ ...formData, id_plateforme: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Select platform</option>
            {plateformes.map((platform) => (
              <option key={platform.id_plateforme} value={platform.id_plateforme}>
                {platform.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (DZD) *
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              placeholder="0.00"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="Payé">Paid</option>
            <option value="En attente">Pending</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date
          </label>
          <input
            type="datetime-local"
            value={formData.date_recharge}
            onChange={(e) => setFormData({ ...formData, date_recharge: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Enter description for this transaction"
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.id_plateforme || !formData.montant}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {loading ? 'Adding Credits...' : 'Add Credits'}
        </button>
      </form>
    </div>
  );
};



// Transaction History Component
interface TransactionHistoryProps {
  onEdit: (recharge: Recharge) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onEdit }) => {
  const { data: rechargesData, loading } = useRecharges();
  const { data: plateformesData } = usePlateformes();
  const { deleteRecharge } = useRechargeActions();

  const recharges = rechargesData?.items || [];
  const plateformes = plateformesData?.items || [];

  const getPlatformName = (id: number) => {
    const platform = plateformes.find(p => p.id_plateforme === id);
    return platform?.nom || 'Unknown Platform';
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteRecharge(id);
        window.location.reload();
      } catch (error) {
        console.error('Error deleting recharge:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Transaction History</h3>
        <p className="text-gray-400 text-sm">View and manage all recharge transactions</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recharges.map((recharge) => (
              <tr key={recharge.id_recharge} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  #{recharge.id_recharge}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {getPlatformName(recharge.id_plateforme)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {formatCurrency(recharge.montant)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    recharge.statut === 'Payé'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recharge.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(recharge.date_recharge)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(recharge)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(recharge.id_recharge)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recharges.length === 0 && (
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-300">No transactions found</h3>
          <p className="mt-2 text-sm text-gray-500">Start by adding your first recharge transaction.</p>
        </div>
      )}
    </div>
  );
};

export default function Recharges() {
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [editingRecharge, setEditingRecharge] = useState<Recharge | null>(null);

  const handleRechargeSuccess = () => {
    // Refresh the page or update data
    window.location.reload();
  };

  const handleEditRecharge = (recharge: Recharge) => {
    setEditingRecharge(recharge);
    setActiveTab('add');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg border-b border-gray-200">
          <div className="flex">
            <TabButton
              id="add"
              label="Add Credits"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              isActive={activeTab === 'add'}
              onClick={setActiveTab}
            />
            <TabButton
              id="history"
              label="Transaction History"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              isActive={activeTab === 'history'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-b-lg p-6">
          {activeTab === 'add' && (
            <AddCreditsForm
              onSuccess={handleRechargeSuccess}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistory
              onEdit={handleEditRecharge}
            />
          )}
        </div>
      </div>
    </div>
  );
}



