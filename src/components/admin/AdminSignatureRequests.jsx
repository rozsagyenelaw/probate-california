import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from '../../services/firebase';
import PdfViewer from './PdfViewer';
import {
  FileSignature,
  Upload,
  X,
  Send,
  FileText,
  Loader2,
  AlertCircle,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';

const AdminSignatureRequests = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [step, setStep] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [message, setMessage] = useState('Please review and sign this document at your earliest convenience.');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [signatureFields, setSignatureFields] = useState([]);
  const [useExistingClient, setUseExistingClient] = useState(true);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientEmail, setManualClientEmail] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');

  useEffect(() => {
    // Load signature requests
    const requestsQuery = query(collection(db, 'signatureRequests'));
    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setRequests(data);
      setLoading(false);
    });

    // Load clients (users)
    const usersQuery = query(collection(db, 'users'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(data);
    });

    return () => {
      unsubRequests();
      unsubUsers();
    };
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setPdfFile(file);
    setDocumentTitle(file.name.replace('.pdf', ''));
    setUploading(true);
    setError('');

    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `signature-requests/${timestamp}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setPdfUrl(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handlePageClick = (position) => {
    const newField = {
      id: Date.now(),
      ...position
    };
    setSignatureFields([...signatureFields, newField]);
  };

  const removeSignatureField = (id) => {
    setSignatureFields(signatureFields.filter(f => f.id !== id));
  };

  const resetModal = () => {
    setStep(1);
    setPdfFile(null);
    setPdfUrl('');
    setSelectedClient('');
    setDocumentTitle('');
    setMessage('Please review and sign this document at your earliest convenience.');
    setSignatureFields([]);
    setError('');
    setUseExistingClient(true);
    setManualClientName('');
    setManualClientEmail('');
    setManualClientPhone('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (useExistingClient) {
      if (!selectedClient) {
        setError('Please select a client');
        return;
      }
    } else {
      if (!manualClientName || !manualClientEmail) {
        setError('Please enter client name and email');
        return;
      }
    }

    if (!pdfUrl) {
      setError('Please upload a document first');
      return;
    }

    if (!sendViaEmail && !sendViaSMS) {
      setError('Please select at least one notification method');
      return;
    }

    setSending(true);
    setError('');

    try {
      let clientName, clientEmail, clientPhone, clientId;

      if (useExistingClient) {
        const client = clients.find(c => c.id === selectedClient);
        if (!client) {
          throw new Error('Client not found');
        }
        clientName = `${client.firstName} ${client.lastName}`;
        clientEmail = client.email;
        clientPhone = client.phone || '';
        clientId = selectedClient;
      } else {
        clientName = manualClientName;
        clientEmail = manualClientEmail;
        clientPhone = manualClientPhone || '';
        clientId = null;
      }

      const requestData = {
        documentTitle,
        documentUrl: pdfUrl,
        clientId: clientId,
        clientName,
        clientEmail,
        clientPhone,
        message,
        signatureFields,
        status: 'pending',
        createdAt: serverTimestamp(),
        signed: false,
        signature: null,
        signedAt: null
      };

      const docRef = await addDoc(collection(db, 'signatureRequests'), requestData);

      try {
        const sendSignatureRequest = httpsCallable(functions, 'sendSignatureRequestNotification');
        await sendSignatureRequest({
          requestId: docRef.id,
          clientName,
          clientEmail,
          clientPhone,
          documentTitle,
          message,
          sendViaEmail,
          sendViaSMS
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        throw new Error(`Failed to send notification: ${notificationError.message}`);
      }

      alert(`Signature request sent to ${clientName}!${sendViaEmail ? '\n- Email notification sent' : ''}${sendViaSMS ? '\n- SMS notification sent' : ''}`);
      setShowModal(false);
      resetModal();
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Failed to send signature request: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signature Requests</h1>
          <p className="text-gray-500">Send documents for electronic signature</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <FileSignature className="h-5 w-5 mr-2" />
          New Signature Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, document, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileSignature className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No signature requests</h3>
            <p className="text-gray-500 mb-4">
              {requests.length === 0
                ? 'Click "New Signature Request" to send your first document'
                : 'No requests match your search criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{request.documentTitle}</p>
                          <p className="text-sm text-gray-500">{request.signatureFields?.length || 0} signature field(s)</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{request.clientName}</p>
                      <p className="text-sm text-gray-500">{request.clientEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      {request.signed || request.status === 'signed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {request.documentUrl && (
                          <a
                            href={request.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Original"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        )}
                        {request.signedPdfUrl && (
                          <a
                            href={request.signedPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="View Signed Document"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-medium text-gray-900">Send Signature Request</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Step {step} of 3: {step === 1 ? 'Upload Document' : step === 2 ? 'Mark Signature Fields' : 'Send Request'}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Step 1: Upload PDF */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Document (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-lg font-medium text-gray-900">Choose PDF to upload</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {pdfFile && (
                        <p className="text-sm text-green-600 mt-2">Selected: {pdfFile.name}</p>
                      )}
                      {uploading && (
                        <div className="mt-4 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {pdfUrl && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Document Title</label>
                        <input
                          type="text"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          PDF uploaded successfully! Click "Next" to mark signature fields.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Mark Signature Fields */}
              {step === 2 && pdfUrl && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium">
                      Click on the PDF where you want the client to sign
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {signatureFields.length} signature field(s) added
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    Total Pages: {totalPages}
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 overflow-auto" style={{ maxHeight: '600px' }}>
                    <PdfViewer
                      pdfUrl={pdfUrl}
                      onPageClick={handlePageClick}
                      signaturePlacements={signatureFields}
                      onLoadSuccess={(numPages) => setTotalPages(numPages)}
                    />
                  </div>

                  {signatureFields.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Signature Fields:</h4>
                      <div className="space-y-2">
                        {signatureFields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Page {field.page} - Position ({field.x.toFixed(0)}%, {field.y.toFixed(0)}%)
                            </span>
                            <button
                              onClick={() => removeSignatureField(field.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Send Request */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Client Information *</label>

                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={useExistingClient}
                          onChange={() => setUseExistingClient(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Select existing client</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!useExistingClient}
                          onChange={() => setUseExistingClient(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enter new client details</span>
                      </label>
                    </div>

                    {useExistingClient ? (
                      <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a client...</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName} ({client.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Full Name *</label>
                          <input
                            type="text"
                            value={manualClientName}
                            onChange={(e) => setManualClientName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Email Address *</label>
                          <input
                            type="email"
                            value={manualClientEmail}
                            onChange={(e) => setManualClientEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Phone Number (optional)</label>
                          <input
                            type="tel"
                            value={manualClientPhone}
                            onChange={(e) => setManualClientPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message to Client</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Notification Method</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sendViaEmail}
                          onChange={(e) => setSendViaEmail(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Send via Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sendViaSMS}
                          onChange={(e) => setSendViaSMS(e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Send via SMS</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Review:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>Document: {documentTitle}</li>
                      <li>Signature Fields: {signatureFields.length}</li>
                      <li>Notifications: {sendViaEmail && 'Email'}{sendViaEmail && sendViaSMS && ', '}{sendViaSMS && 'SMS'}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                  } else {
                    setShowModal(false);
                    resetModal();
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !pdfUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={sending || !pdfUrl || (useExistingClient ? !selectedClient : (!manualClientName || !manualClientEmail))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSignatureRequests;
