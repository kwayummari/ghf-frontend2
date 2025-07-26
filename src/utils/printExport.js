import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToPDF = (data, columns, title = 'Report') => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor('#4F78AE');
    doc.text(title, 20, 25);

    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 20, 35);

    // Table
    const tableColumns = columns.map(col => col.headerName);
    const tableRows = data.map(row =>
        columns.map(col => {
            const value = row[col.field];
            if (col.type === 'currency' && value) {
                return `TZS ${parseFloat(value).toLocaleString()}`;
            }
            if (col.type === 'date' && value) {
                return format(new Date(value), 'MMM dd, yyyy');
            }
            return value || '-';
        })
    );

    doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: {
            fillColor: [79, 120, 174],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        margin: { top: 45, left: 20, right: 20 }
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportToCSV = (data, columns, filename = 'export') => {
    const headers = columns.map(col => col.headerName);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            columns.map(col => {
                const value = row[col.field];
                if (col.type === 'currency' && value) {
                    return `"TZS ${parseFloat(value).toLocaleString()}"`;
                }
                if (col.type === 'date' && value) {
                    return `"${format(new Date(value), 'MMM dd, yyyy')}"`;
                }
                return `"${value || ''}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const printReconciliationSheet = (bookData, expenses = []) => {
    const printWindow = window.open('', '_blank');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Petty Cash Reconciliation Sheet</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #000000;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #4F78AE;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4F78AE;
          margin: 0;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-box {
          border: 1px solid #C2895A;
          padding: 15px;
          border-radius: 5px;
          width: 45%;
        }
        .info-box h3 {
          color: #4F78AE;
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #C2895A;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #4F78AE;
          color: white;
          font-weight: bold;
        }
        .summary {
          background-color: #f8f9fa;
          padding: 20px;
          border: 2px solid #4F78AE;
          border-radius: 5px;
          margin-top: 30px;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #000000;
          margin-top: 50px;
          padding-top: 5px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GH FOUNDATION</h1>
        <h2>PETTY CASH RECONCILIATION SHEET</h2>
        <p>Book: ${bookData.book_number || 'N/A'}</p>
        <p>Date: ${format(new Date(), 'MMMM dd, yyyy')}</p>
      </div>
      
      <div class="info-section">
        <div class="info-box">
          <h3>Book Information</h3>
          <p><strong>Custodian:</strong> ${bookData.custodian?.first_name || ''} ${bookData.custodian?.sur_name || ''}</p>
          <p><strong>Opening Balance:</strong> TZS ${parseFloat(bookData.opening_balance || 0).toLocaleString()}</p>
          <p><strong>Current Balance:</strong> TZS ${parseFloat(bookData.current_balance || 0).toLocaleString()}</p>
        </div>
        <div class="info-box">
          <h3>Period Information</h3>
          <p><strong>From:</strong> ${format(new Date(), 'MMM dd, yyyy')}</p>
          <p><strong>To:</strong> ${format(new Date(), 'MMM dd, yyyy')}</p>
          <p><strong>Total Expenses:</strong> TZS ${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()}</p>
        </div>
      </div>
      
      <h3 style="color: #4F78AE;">TRANSACTION SUMMARY</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount (TZS)</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(expense => `
            <tr>
              <td>${format(new Date(expense.date), 'MMM dd, yyyy')}</td>
              <td>${expense.description}</td>
              <td>${parseFloat(expense.amount).toLocaleString()}</td>
              <td>${expense.receipt_document_id ? 'Yes' : 'No'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <h3 style="color: #4F78AE; margin-top: 0;">RECONCILIATION SUMMARY</h3>
        <table style="margin: 0;">
          <tr>
            <td><strong>Opening Balance</strong></td>
            <td>TZS ${parseFloat(bookData.opening_balance || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Total Expenses</strong></td>
            <td>TZS ${expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Remaining Balance</strong></td>
            <td>TZS ${parseFloat(bookData.current_balance || 0).toLocaleString()}</td>
          </tr>
          <tr style="background-color: #4F78AE; color: white;">
            <td><strong>Cash on Hand</strong></td>
            <td><strong>TZS ${parseFloat(bookData.current_balance || 0).toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">
            <strong>Prepared by</strong><br>
            ${bookData.custodian?.first_name || ''} ${bookData.custodian?.sur_name || ''}
          </div>
        </div>
        <div class="signature-box">
          <div class="signature-line">
            <strong>Approved by</strong><br>
            Finance Manager
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};