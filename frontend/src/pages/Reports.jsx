import { Link, Routes, Route } from 'react-router-dom';

function ReportsList() {
  const reports = [
    { name: 'Accounting Profit', path: 'accounting-profit', description: 'View accounting profit calculation' },
    { name: 'VAT Report', path: 'vat', description: 'VAT collected, paid, and net' },
    { name: 'WHT Report', path: 'wht', description: 'WHT payable and receivable' },
    { name: 'PAYE Report', path: 'paye', description: 'PAYE breakdown by employee' },
    { name: 'CIT Report', path: 'cit', description: 'Company Income Tax computation' },
    { name: 'PIT Report', path: 'pit', description: 'Personal Income Tax for sole proprietors' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            View financial and tax reports for your business
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link
            key={report.path}
            to={report.path}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{report.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReportDetail({ title }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Export PDF
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Export Excel
          </button>
        </div>
      </div>
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">
            Report data will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <Routes>
      <Route index element={<ReportsList />} />
      <Route path="accounting-profit" element={<ReportDetail title="Accounting Profit Report" />} />
      <Route path="vat" element={<ReportDetail title="VAT Report" />} />
      <Route path="wht" element={<ReportDetail title="WHT Report" />} />
      <Route path="paye" element={<ReportDetail title="PAYE Report" />} />
      <Route path="cit" element={<ReportDetail title="CIT Report" />} />
      <Route path="pit" element={<ReportDetail title="PIT Report" />} />
    </Routes>
  );
}
