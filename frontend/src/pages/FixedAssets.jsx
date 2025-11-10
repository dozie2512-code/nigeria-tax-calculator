export default function FixedAssets() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Fixed Assets</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your fixed assets
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Add Asset
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Calculate Depreciation
          </button>
        </div>
      </div>
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500">
            Fixed assets list will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
}
