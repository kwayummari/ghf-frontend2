import apiClient from './axios.config';
import { API_ENDPOINTS } from '../../constants';

export const procurementAPI = {
    // Suppliers Management
    getAllSuppliers: (params = {}) => apiClient.get(API_ENDPOINTS.SUPPLIERS, { params }),
    getSupplierById: (id) => apiClient.get(API_ENDPOINTS.SUPPLIER_BY_ID(id)),
    createSupplier: (supplierData) => apiClient.post(API_ENDPOINTS.SUPPLIERS, supplierData),
    updateSupplier: (id, supplierData) => apiClient.put(API_ENDPOINTS.SUPPLIER_BY_ID(id), supplierData),
    deleteSupplier: (id) => apiClient.delete(API_ENDPOINTS.SUPPLIER_BY_ID(id)),
    verifySupplier: (id) => apiClient.put(`${API_ENDPOINTS.SUPPLIER_BY_ID(id)}/verify`),
    suspendSupplier: (id, reason) => apiClient.put(`${API_ENDPOINTS.SUPPLIER_BY_ID(id)}/suspend`, { reason }),
    activateSupplier: (id) => apiClient.put(`${API_ENDPOINTS.SUPPLIER_BY_ID(id)}/activate`),

    // Quotations Management
    getAllQuotations: (params = {}) => apiClient.get(API_ENDPOINTS.QUOTATIONS, { params }),
    getQuotationById: (id) => apiClient.get(API_ENDPOINTS.QUOTATION_BY_ID(id)),
    createQuotation: (quotationData) => apiClient.post(API_ENDPOINTS.QUOTATIONS, quotationData),
    updateQuotation: (id, quotationData) => apiClient.put(API_ENDPOINTS.QUOTATION_BY_ID(id), quotationData),
    deleteQuotation: (id) => apiClient.delete(API_ENDPOINTS.QUOTATION_BY_ID(id)),
    submitQuotation: (id) => apiClient.put(`${API_ENDPOINTS.QUOTATION_BY_ID(id)}/submit`),
    approveQuotation: (id, approvalData) => apiClient.put(`${API_ENDPOINTS.QUOTATION_BY_ID(id)}/approve`, approvalData),
    rejectQuotation: (id, rejectionData) => apiClient.put(`${API_ENDPOINTS.QUOTATION_BY_ID(id)}/reject`, rejectionData),

    // Quotation Comparison
    compareQuotations: (requestId) => apiClient.get(API_ENDPOINTS.QUOTATION_COMPARE, {
        params: { request_id: requestId }
    }),
    getQuotationsByRequest: (requestId) => apiClient.get(`${API_ENDPOINTS.QUOTATIONS}/by-request/${requestId}`),
    selectWinningQuotation: (quotationId, selectionData) => apiClient.put(`${API_ENDPOINTS.QUOTATION_BY_ID(quotationId)}/select`, selectionData),

    // Purchase Orders Management
    getAllPurchaseOrders: (params = {}) => apiClient.get(API_ENDPOINTS.PURCHASE_ORDERS, { params }),
    getPurchaseOrderById: (id) => apiClient.get(API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id)),
    createPurchaseOrder: (orderData) => apiClient.post(API_ENDPOINTS.PURCHASE_ORDERS, orderData),
    updatePurchaseOrder: (id, orderData) => apiClient.put(API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id), orderData),
    approvePurchaseOrder: (id, approvalData) => apiClient.put(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id)}/approve`, approvalData),
    cancelPurchaseOrder: (id, cancellationData) => apiClient.put(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id)}/cancel`, cancellationData),

    // LPO Generation
    generateLPO: (id, lpoData) => apiClient.post(API_ENDPOINTS.GENERATE_LPO(id), lpoData),
    downloadLPO: (id) => apiClient.get(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(id)}/lpo/download`, {
        responseType: 'blob'
    }),

    // Purchase Requests Management
    getAllPurchaseRequests: (params = {}) => apiClient.get(API_ENDPOINTS.PURCHASE_REQUESTS, { params }),
    getPurchaseRequestById: (id) => apiClient.get(API_ENDPOINTS.PURCHASE_REQUEST_BY_ID(id)),
    createPurchaseRequest: (requestData) => apiClient.post(API_ENDPOINTS.PURCHASE_REQUESTS, requestData),
    updatePurchaseRequest: (id, requestData) => apiClient.put(API_ENDPOINTS.PURCHASE_REQUEST_BY_ID(id), requestData),
    approvePurchaseRequest: (id, approvalData) => apiClient.put(API_ENDPOINTS.PURCHASE_REQUEST_APPROVE(id), approvalData),
    rejectPurchaseRequest: (id, rejectionData) => apiClient.put(`${API_ENDPOINTS.PURCHASE_REQUEST_BY_ID(id)}/reject`, rejectionData),

    // Vendor Selection & Management
    requestQuotations: (requestId, supplierIds) => apiClient.post(`${API_ENDPOINTS.PURCHASE_REQUEST_BY_ID(requestId)}/request-quotations`, {
        supplier_ids: supplierIds
    }),
    getSupplierPerformance: (supplierId, params = {}) => apiClient.get(`${API_ENDPOINTS.SUPPLIER_BY_ID(supplierId)}/performance`, { params }),
    rateSupplier: (supplierId, ratingData) => apiClient.post(`${API_ENDPOINTS.SUPPLIER_BY_ID(supplierId)}/rate`, ratingData),

    // Delivery & Receipt Management
    updateDeliveryStatus: (orderId, deliveryData) => apiClient.put(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(orderId)}/delivery`, deliveryData),
    confirmReceipt: (orderId, receiptData) => apiClient.put(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(orderId)}/receipt`, receiptData),
    uploadDeliveryNote: (orderId, documentData) => apiClient.post(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(orderId)}/delivery-note`, documentData),
    uploadInvoice: (orderId, invoiceData) => apiClient.post(`${API_ENDPOINTS.PURCHASE_ORDER_BY_ID(orderId)}/invoice`, invoiceData),

    // Reports & Analytics
    getProcurementReports: (params = {}) => apiClient.get(`${API_ENDPOINTS.PURCHASE_ORDERS}/reports`, { params }),
    getSupplierAnalytics: (params = {}) => apiClient.get(`${API_ENDPOINTS.SUPPLIERS}/analytics`, { params }),
    getSpendAnalysis: (params = {}) => apiClient.get(`${API_ENDPOINTS.PURCHASE_ORDERS}/spend-analysis`, { params }),
    getQuotationAnalytics: (params = {}) => apiClient.get(`${API_ENDPOINTS.QUOTATIONS}/analytics`, { params }),

    // Export Functions
    exportSuppliers: (params = {}) => apiClient.get(`${API_ENDPOINTS.SUPPLIERS}/export`, {
        params,
        responseType: 'blob'
    }),
    exportPurchaseOrders: (params = {}) => apiClient.get(`${API_ENDPOINTS.PURCHASE_ORDERS}/export`, {
        params,
        responseType: 'blob'
    }),
    exportQuotationComparison: (requestId) => apiClient.get(`${API_ENDPOINTS.QUOTATIONS}/comparison-export/${requestId}`, {
        responseType: 'blob'
    }),
};