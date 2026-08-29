import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EmployeesListPage } from './pages/employees/EmployeesListPage';
import { EmployeeFormPage } from './pages/employees/EmployeeFormPage';
import { EmployeeDetailPage } from './pages/employees/EmployeeDetailPage';
import { PayrollListPage } from './pages/payroll/PayrollListPage';
import { PayrollFormPage } from './pages/payroll/PayrollFormPage';
import { PayrollDetailPage } from './pages/payroll/PayrollDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/employees" element={<EmployeesListPage />} />
        <Route path="/employees/new" element={<EmployeeFormPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />

        <Route path="/payroll" element={<PayrollListPage />} />
        <Route path="/payroll/new" element={<PayrollFormPage />} />
        <Route path="/payroll/:id" element={<PayrollDetailPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
