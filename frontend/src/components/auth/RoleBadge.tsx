import { UserRole } from '../../utils/permissions';
import { getRoleColor, getRoleLabel } from '../../utils/permissions';

interface RoleBadgeProps {
  role: UserRole;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RoleBadge({ role, showLabel = true, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full text-white font-medium ${sizeClasses[size]} ${getRoleColor(role)}`}
    >
      {role === 'admin' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
      {showLabel && getRoleLabel(role)}
    </span>
  );
}
