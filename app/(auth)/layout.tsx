export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center px-4 py-8 md:px-8">{children}</div>;
}
