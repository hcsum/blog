import TopBar from "@/components/TopBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <TopBar />
      {children}
      <div className="py-10">
        <hr />
        <p className="text-center">haochen xu</p>
      </div>
    </div>
  );
};

export default Layout;
