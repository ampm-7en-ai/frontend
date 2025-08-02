
import React, { useState } from 'react';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';

interface DocsLayoutProps {
  children: React.ReactNode;
  navigation: NavigationItem[];
}

interface NavigationItem {
  title: string;
  href: string;
  children?: NavigationItem[];
}

const DocsLayout = ({ children, navigation }: DocsLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <h1 className="text-xl font-bold">7en.ai API Documentation</h1>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 transform bg-background border-r
          transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col overflow-y-auto p-4 pt-20 md:pt-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ item }: { item: NavigationItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <a
        href={item.href}
        className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        onClick={(e) => {
          if (item.children) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span>{item.title}</span>
        {item.children && (
          <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            ▶
          </span>
        )}
      </a>
      {item.children && isOpen && (
        <div className="ml-4 mt-2 space-y-1">
          {item.children.map((child) => (
            <NavItem key={child.href} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocsLayout;
