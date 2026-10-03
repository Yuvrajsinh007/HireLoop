import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-100 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Campus placement intelligence for students, alumni, and placement
              teams.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Explore</h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/companies"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Companies
              </Link>

              <Link
                to="/drives"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Placement drives
              </Link>

              <Link
                to="/experiences"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Interview experiences
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Account</h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/login"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Create account
              </Link>

              <Link
                to="/forgot-password"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">For institutions</h3>

            <div className="mt-4 space-y-3">
              <Link
                to="/register-institution"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Register institution
              </Link>

              <Link
                to="/login"
                className="block text-sm text-slate-500 transition hover:text-indigo-600"
              >
                Placement officer sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} HireLoop. All rights reserved.
          </p>

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Built for campuses
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;