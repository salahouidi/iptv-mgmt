import SimplePageMeta from "../../components/common/SimplePageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <SimplePageMeta
        title="Reset Password | IPTV Management - TailAdmin Dashboard"
        description="Reset your password for IPTV Management Dashboard"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
