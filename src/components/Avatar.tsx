import React from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  fullName?: string;
  email?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  fullName,
  email,
  className = 'w-6 h-6',
}) => {
  const getInitials = (name?: string, emailVal?: string): string => {
    if (name) {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (emailVal) {
      return emailVal[0].toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(fullName, email);

  // Generate a consistent color based on initials
  const getColorClass = (initials: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const bgColor = getColorClass(initials);

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName || 'User'}
          className={`${className} rounded-full border border-border object-cover transition-transform duration-200 group-hover:scale-110`}
        />
      ) : (
        <div
          className={`${className} rounded-full border border-border ${bgColor} flex items-center justify-center text-white text-xs font-semibold transition-transform duration-200 group-hover:scale-110`}
        >
          {initials}
        </div>
      )}
    </>
  );
};
