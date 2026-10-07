import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import { useAuth } from "../features/auth/useAuth";
import MyPayslipsPage from "../features/payslips/MyPayslipsPage";
import EmployeesPage from "../features/employees/EmployeesPage";
import PayrollRunsPage from "../features/payroll/PayrollRunsPage";

const STAFF = ["ADMIN", "HR"];

// "/" sends each role to its natural landing page
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={STAFF.includes(user.role) ? "/payroll" : "/payslips"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* everything below requires a signed-in user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="payslips" element={<MyPayslipsPage />} />

          {/* ADMIN and HR only */}
          <Route element={<ProtectedRoute roles={STAFF} />}>
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="payroll" element={<PayrollRunsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}