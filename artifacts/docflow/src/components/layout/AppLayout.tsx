import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, UploadCloud, ListTree, Bell, Search, Menu, Settings, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/upload", label: "Upload Documents", icon: UploadCloud },
  { path: "/jobs", label: "Processing Jobs", icon: ListTree },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full text-foreground overflow-hidden selection:bg-primary/20">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border/60 bg-gradient-to-b from-slate-50 to-white dark:from-sidebar dark:to-sidebar/95 backdrop-blur-xl relative z-20">
        <div className="h-20 flex items-center px-8 border-b border-border/60">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">DocFlow</span>
          </div>
        </div>
        
        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-4">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground font-medium"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border/60 bg-card/30">
          <button className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl hover:bg-muted transition-colors duration-200 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-background">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">Jane Doe</p>
              <p className="text-xs text-muted-foreground truncate">jane@example.com</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 relative z-10 sticky top-0">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2.5 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center relative group">
              <Search className="w-4 h-4 absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search documents, jobs..." 
                className="pl-11 pr-4 py-2.5 bg-muted/40 border border-transparent hover:border-border/60 hover:bg-muted/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm w-72 transition-all duration-300 outline-none font-medium placeholder:text-muted-foreground/70 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all relative shadow-sm border border-transparent hover:border-border/50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background animate-pulse"></span>
            </button>
            <button className="md:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-sm">
              JD
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border shadow-2xl z-50 flex flex-col md:hidden"
              >
                <div className="h-20 flex items-center px-6 border-b border-border/50">
                   <div className="flex items-center gap-3 text-primary">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20">
                      <UploadCloud className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display font-bold text-2xl tracking-tight text-foreground">DocFlow</span>
                  </div>
                </div>
                <div className="flex-1 py-6 px-4 flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors font-medium ${
                          isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content with Animation */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
