import React, { useState } from 'react';
import { reportService } from '../services/api';

function Reports({ business }) {
  const [reportType, setReportType] = useState('accounting-profit');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      const params = { startDate, endDate };
      
      switch (reportType) {
        case 'accounting-profit':
          res = await reportService.getAccountingProfit(business.id, params);
          break;
        case 'cit':
          res = await reportService.getCIT(business.id, params);
          break;
        case 'pit':
          res = await reportService.getPIT(business.id, params);
          break;
        case 'vat':
          res = await reportService.getVAT(business.id, params);
          break;
        case 'wht':
          res = await reportService.getWHT(business.id, params);
          break;
        case 'paye':
          res = await reportService.getPAYE(business.id, params);
          break;
        default:
          res = await reportService.getAccountingProfit(business.id, params);
      }
      
      setReportData(res.data);
    } catch (error) {
      alert('Error loading report: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const params = { startDate, endDate };
      const exportFn = format === 'excel' ? reportService.exportExcel : reportService.exportPDF;
      const res = await exportFn(business.id, reportType, params);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error exporting report');
    }
  };

  return (
    <div>
      <h1>Reports</h1>
      
      <div className="card">
        <h3>Generate Report</h3>
        <div className="grid">
          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="accounting-profit">Accounting Profit</option>
              <option value="cit">CIT Computation</option>
              <option value="pit">PIT Computation</option>
              <option value="vat">VAT Report</option>
              <option value="wht">WHT Report</option>
              <option value="paye">PAYE Report</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <button onClick={loadReport} className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
          {reportData && (
            <>
              <button onClick={() => exportReport('excel')} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                Export to Excel
              </button>
              <button onClick={() => exportReport('pdf')} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                Export to PDF
              </button>
            </>
          )}
        </div>
      </div>

      {reportData && (
        <div className="card">
          <h3>Report Results</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Reports;
