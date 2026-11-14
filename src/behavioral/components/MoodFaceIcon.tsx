import React from 'react';

interface MoodFaceIconProps {
  level: 1 | 2 | 3 | 4 | 5;
  active?: boolean;
  className?: string;
}

/**
 * Minimal geometric face glyph inspired by the tactile circular mood buttons,
 * scaled cleanly for 1..5 intensity or valence ratings.
 */
export const MoodFaceIcon: React.FC<MoodFaceIconProps> = ({
  level,
  active = false,
  className = 'w-6 h-6',
}) => {
  const strokeColor = active ? 'currentColor' : 'currentColor';

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {level === 1 && (
        <>
          <path
            d="M8.5 11.5C9.3 10.6 10.7 10.6 11.5 11.5"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M16.5 11.5C17.3 10.6 18.7 10.6 19.5 11.5"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M9.5 18.5C10.8 16.5 17.2 16.5 18.5 18.5"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </>
      )}
      {level === 2 && (
        <>
          <circle cx="10.2" cy="11.2" r="1.4" fill={strokeColor} />
          <circle cx="17.8" cy="11.2" r="1.4" fill={strokeColor} />
          <path
            d="M10.2 17.8C11.4 16.4 16.6 16.4 17.8 17.8"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </>
      )}
      {level === 3 && (
        <>
          <circle cx="10.2" cy="11.4" r="1.45" fill={strokeColor} />
          <circle cx="17.8" cy="11.4" r="1.45" fill={strokeColor} />
          <line
            x1="10"
            y1="17"
            x2="18"
            y2="17"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {level === 4 && (
        <>
          <circle cx="10.2" cy="11.2" r="1.4" fill={strokeColor} />
          <circle cx="17.8" cy="11.2" r="1.4" fill={strokeColor} />
          <path
            d="M10 16.2C11.3 18 16.7 18 18 16.2"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </>
      )}
      {level === 5 && (
        <>
          <path
            d="M8.5 11.8C9.3 10.2 10.9 10.2 11.7 11.8"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M16.3 11.8C17.1 10.2 18.7 10.2 19.5 11.8"
            stroke={strokeColor}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M9.4 15.8C11 18.7 17 18.7 18.6 15.8Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};
