import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentBusiness } = useAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome to {currentBusiness?.name || 'your business'}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Business Type
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {currentBusiness?.type === 'company' ? 'Company' : 'Sole Proprietor'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Quick Actions
                  </dt>
                  <dd className="text-sm text-gray-900">
                    <a href="/transactions" className="text-indigo-600 hover:text-indigo-900">
                      Add Transaction
                    </a>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reports
                  </dt>
                  <dd className="text-sm text-gray-900">
                    <a href="/reports" className="text-indigo-600 hover:text-indigo-900">
                      View Reports
                    </a>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/chart-of-accounts" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900">Chart of Accounts</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your accounts</p>
          </a>
          <a href="/inventory" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900">Inventory</h3>
            <p className="mt-1 text-sm text-gray-500">Track inventory items</p>
          </a>
          <a href="/fixed-assets" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900">Fixed Assets</h3>
            <p className="mt-1 text-sm text-gray-500">Manage fixed assets</p>
          </a>
          <a href="/settings" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900">Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Configure business settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}
