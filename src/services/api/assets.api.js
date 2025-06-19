import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const assetsAPI = {
    // Asset Register Management
    getAllAssets: (params = {}) => apiClient.get(API_ENDPOINTS.ASSETS, { params }),
    getAssetById: (id) => apiClient.get(API_ENDPOINTS.ASSET_BY_ID(id)),
    createAsset: (assetData) => apiClient.post(API_ENDPOINTS.ASSETS, assetData),
    updateAsset: (id, assetData) => apiClient.put(API_ENDPOINTS.ASSET_BY_ID(id), assetData),
    deleteAsset: (id) => apiClient.delete(API_ENDPOINTS.ASSET_BY_ID(id)),

    // Asset Register Operations
    getAssetRegister: (params = {}) => apiClient.get(API_ENDPOINTS.ASSET_REGISTER, { params }),
    registerAsset: (registrationData) => apiClient.post(API_ENDPOINTS.ASSET_REGISTER, registrationData),
    updateAssetRegister: (assetId, updateData) => apiClient.put(`${API_ENDPOINTS.ASSET_REGISTER}/${assetId}`, updateData),

    // Asset Categories & Classification
    getAssetCategories: () => apiClient.get(`${API_ENDPOINTS.ASSETS}/categories`),
    createAssetCategory: (categoryData) => apiClient.post(`${API_ENDPOINTS.ASSETS}/categories`, categoryData),
    getAssetsByCategory: (categoryId, params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/category/${categoryId}`, { params }),

    // Asset Location Management
    getAssetLocations: () => apiClient.get(`${API_ENDPOINTS.ASSETS}/locations`),
    getAssetsByLocation: (location, params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/location`, {
        params: { location, ...params }
    }),
    transferAsset: (assetId, transferData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/transfer`, transferData),

    // Asset Custodian Management
    assignCustodian: (assetId, custodianData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/assign-custodian`, custodianData),
    getAssetsByCustodian: (custodianId, params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/custodian/${custodianId}`, { params }),
    getCustodianHistory: (assetId) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/custodian-history`),

    // Asset Depreciation
    getDepreciationReport: (params = {}) => apiClient.get(API_ENDPOINTS.ASSET_DEPRECIATION, { params }),
    calculateDepreciation: (assetId, calculationData) => apiClient.post(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/calculate-depreciation`, calculationData),
    updateDepreciationMethod: (assetId, methodData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/depreciation-method`, methodData),
    getDepreciationSchedule: (assetId) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/depreciation-schedule`),

    // Asset Maintenance
    getAllMaintenanceRecords: (params = {}) => apiClient.get(API_ENDPOINTS.ASSET_MAINTENANCE, { params }),
    getMaintenanceById: (id) => apiClient.get(API_ENDPOINTS.ASSET_MAINTENANCE_BY_ID(id)),
    createMaintenanceRecord: (maintenanceData) => apiClient.post(API_ENDPOINTS.ASSET_MAINTENANCE, maintenanceData),
    updateMaintenanceRecord: (id, maintenanceData) => apiClient.put(API_ENDPOINTS.ASSET_MAINTENANCE_BY_ID(id), maintenanceData),
    deleteMaintenanceRecord: (id) => apiClient.delete(API_ENDPOINTS.ASSET_MAINTENANCE_BY_ID(id)),

    // Maintenance Scheduling
    getMaintenanceByAsset: (assetId, params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/maintenance`, { params }),
    scheduleMaintenance: (assetId, scheduleData) => apiClient.post(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/schedule-maintenance`, scheduleData),
    getMaintenanceDue: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_MAINTENANCE}/due`, { params }),
    getMaintenanceCalendar: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_MAINTENANCE}/calendar`, { params }),
    completeMaintenance: (maintenanceId, completionData) => apiClient.put(`${API_ENDPOINTS.ASSET_MAINTENANCE_BY_ID(maintenanceId)}/complete`, completionData),

    // Asset Valuation & Revaluation
    revalueAsset: (assetId, valuationData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/revalue`, valuationData),
    getValuationHistory: (assetId) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/valuation-history`),
    getCurrentValue: (assetId) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/current-value`),

    // Asset Disposal
    disposeAsset: (assetId, disposalData) => apiClient.put(API_ENDPOINTS.ASSET_DISPOSAL(assetId), disposalData),
    getDisposalRecords: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/disposals`, { params }),
    approveDisposal: (assetId, approvalData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/approve-disposal`, approvalData),

    // Asset Audit & Verification
    createAuditRecord: (auditData) => apiClient.post(`${API_ENDPOINTS.ASSETS}/audit`, auditData),
    getAuditRecords: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/audit`, { params }),
    verifyAsset: (assetId, verificationData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/verify`, verificationData),
    markAssetMissing: (assetId, reportData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/missing`, reportData),

    // Asset Tagging & Barcoding
    generateBarcode: (assetId) => apiClient.post(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/generate-barcode`),
    generateQRCode: (assetId) => apiClient.post(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/generate-qrcode`),
    printAssetTags: (assetIds) => apiClient.post(`${API_ENDPOINTS.ASSETS}/print-tags`, { asset_ids: assetIds }, {
        responseType: 'blob'
    }),

    // Asset Insurance & Warranty
    updateInsurance: (assetId, insuranceData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/insurance`, insuranceData),
    getInsuranceExpiring: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/insurance-expiring`, { params }),
    updateWarranty: (assetId, warrantyData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/warranty`, warrantyData),
    getWarrantyExpiring: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/warranty-expiring`, { params }),

    // Asset Reports & Analytics
    getAssetSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/summary`, { params }),
    getDepreciationSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_DEPRECIATION}/summary`, { params }),
    getMaintenanceCosts: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_MAINTENANCE}/costs`, { params }),
    getAssetUtilization: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/utilization`, { params }),

    // Asset Lifecycle Management
    getAssetLifecycle: (assetId) => apiClient.get(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/lifecycle`),
    updateAssetStatus: (assetId, statusData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/status`, statusData),
    retireAsset: (assetId, retirementData) => apiClient.put(`${API_ENDPOINTS.ASSET_BY_ID(assetId)}/retire`, retirementData),

    // Export Functions
    exportAssetRegister: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_REGISTER}/export`, {
        params,
        responseType: 'blob'
    }),
    exportDepreciationReport: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_DEPRECIATION}/export`, {
        params,
        responseType: 'blob'
    }),
    exportMaintenanceReport: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSET_MAINTENANCE}/export`, {
        params,
        responseType: 'blob'
    }),
    exportAssetSummary: (params = {}) => apiClient.get(`${API_ENDPOINTS.ASSETS}/summary/export`, {
        params,
        responseType: 'blob'
    }),
};