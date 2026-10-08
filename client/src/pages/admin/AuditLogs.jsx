import DashboardLayout from "../../components/common/DashboardLayout";

const AuditLogs = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Audit Logs</h1>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">System audit logs will be displayed here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
