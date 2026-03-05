// Export utilities for subscribers
import * as XLSX from 'xlsx';

/**
 * Format date for export
 */
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Prepare subscriber data for export
 */
function prepareSubscriberData(subscribers) {
  return subscribers.map(subscriber => ({
    'Email': subscriber.email,
    'Status': subscriber.status === 'active' ? 'Active' : 'Unsubscribed',
    'Date Joined': formatDate(subscriber.createdAt)
  }));
}

/**
 * Export subscribers to Excel (.xlsx)
 */
export function exportToExcel(subscribers, filename = 'subscribers') {
  const data = prepareSubscriberData(subscribers);
  
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // Email
    { wch: 15 }, // Status
    { wch: 20 }, // Date Joined
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
  
  // Generate and download file
  XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
}

/**
 * Export subscribers to CSV
 */
export function exportToCSV(subscribers, filename = 'subscribers') {
  const data = prepareSubscriberData(subscribers);
  
  // Create CSV content
  const headers = ['Email', 'Status', 'Date Joined'];
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = [
      `"${row.Email}"`,
      `"${row.Status}"`,
      `"${row['Date Joined']}"`
    ];
    csvRows.push(values.join(','));
  });
  
  const csvContent = csvRows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

