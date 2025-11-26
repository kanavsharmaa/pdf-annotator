import { Link } from 'react-router-dom';
import { useUserContext, ROLES } from '@contexts/UserContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, User } from 'lucide-react';
import type { Role } from '@/types';

export const Header = () => {
  const { currentUser, setCurrentUser } = useUserContext();

  const handleUserChange = (value: string): void => {
    setCurrentUser(value as Role);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PDF Annotator
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <label htmlFor="user-select" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Current User:
          </label>
          <Select value={currentUser} onValueChange={handleUserChange}>
            <SelectTrigger className="w-[120px]" id="user-select">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};
