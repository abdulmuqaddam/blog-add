'use client';

import { useState } from 'react';
import { exportToExcel, exportToCSV } from '@/lib/exportUtils';
import { sendNewsletter, sendEmailToSubscriber } from '@/lib/actions/subscriberActions';
import { Mail, Users, Calendar, FileSpreadsheet, FileText, Send, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SubscribersTable({ initialSubscribers }) {
  const [subscribers] = useState(initialSubscribers);
  const [showModal, setShowModal] = useState(false);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [emailData, setEmailData] = useState({ subject: '', content: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleExportExcel = () => {
    exportToExcel(subscribers, 'subscribers');
  };

  const handleExportCSV = () => {
    exportToCSV(subscribers, 'subscribers');
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const res = await sendNewsletter(emailData);
      setResult(res);
    } catch (error) {
      setResult({ success: false, message: 'Failed to send newsletter' });
    } finally {
      setSending(false);
    }
  };

  const handleSendSingleEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const res = await sendEmailToSubscriber({
        email: selectedSubscriber.email,
        subject: emailData.subject,
        content: emailData.content
      });
      setResult(res);
    } catch (error) {
      setResult({ success: false, message: 'Failed to send email' });
    } finally {
      setSending(false);
    }
  };

  const openSingleSendModal = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowSingleModal(true);
    setResult(null);
    setEmailData({ subject: '', content: '' });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Send className="w-5 h-5" />
          <span>Send Newsletter</span>
        </button>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export to Excel</span>
        </button>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-600 border-2 border-indigo-600 font-medium rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
        >
          <FileText className="w-5 h-5" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Send Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Send Newsletter</h3>
              <button
                onClick={() => { setShowModal(false); setResult(null); setEmailData({ subject: '', content: '' }); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {result ? (
              <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <p className={result.success ? 'text-green-700' : 'text-red-700'}>{result.message}</p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setResult(null); setEmailData({ subject: '', content: '' }); }}
                  className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendNewsletter}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={emailData.content}
                    onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                    placeholder="Write your newsletter content here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setResult(null); setEmailData({ subject: '', content: '' }); }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to {subscribers.filter(s => s.status === 'active').length} subscribers
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Send Single Email Modal */}
      {showSingleModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Send Email</h3>
                <p className="text-sm text-gray-500 mt-1">To: {selectedSubscriber.email}</p>
              </div>
              <button
                onClick={() => { setShowSingleModal(false); setResult(null); setEmailData({ subject: '', content: '' }); setSelectedSubscriber(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {result ? (
              <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  <p className={result.success ? 'text-green-700' : 'text-red-700'}>{result.message}</p>
                </div>
                <button
                  onClick={() => { setShowSingleModal(false); setResult(null); setEmailData({ subject: '', content: '' }); setSelectedSubscriber(null); }}
                  className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendSingleEmail}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={emailData.content}
                    onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowSingleModal(false); setResult(null); setEmailData({ subject: '', content: '' }); setSelectedSubscriber(null); }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Subscribers</h2>
        </div>
        
        {subscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subscriber.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {subscriber.status === 'active' ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(subscriber.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.status === 'active' && (
                        <button
                          onClick={() => openSingleSendModal(subscriber)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers yet</h3>
            <p className="text-gray-500">Start promoting your newsletter to get subscribers.</p>
          </div>
        )}
      </div>
    </div>
  );
}

