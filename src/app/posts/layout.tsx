import Breadcrumb from "@/components/Breadcrumb";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Breadcrumb />
      {children}
    </div>
  );
};

export default Layout;
