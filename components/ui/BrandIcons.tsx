interface IconProps {
  className?: string;
  size?: number;
}

export function YouTubeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088C19.54 3.617 12 3.617 12 3.617s-7.52 0-9.396.501A3.007 3.007 0 0 0 .516 6.205a31.25 31.25 0 0 0-.5 5.795 31.25 31.25 0 0 0 .5 5.783 3.007 3.007 0 0 0 2.088 2.088C4.48 20.383 12 20.383 12 20.383s7.52 0 9.407-.512a3.007 3.007 0 0 0 2.088-2.088 31.25 31.25 0 0 0 .5-5.783 31.25 31.25 0 0 0-.5-5.795z"
        fill="#FF0000"
      />
      <path d="M9.609 15.601V8.408l6.264 3.602-6.264 3.591z" fill="#fff" />
    </svg>
  );
}

export function TikTokIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.67a8.27 8.27 0 0 0 4.84 1.55V6.78a4.85 4.85 0 0 1-1.07-.09z" />
    </svg>
  );
}

export function InstagramIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#feda77" />
          <stop offset="25%" stopColor="#f58529" />
          <stop offset="50%" stopColor="#dd2a7b" />
          <stop offset="75%" stopColor="#8134af" />
          <stop offset="100%" stopColor="#515bd4" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="white" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.3" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="white" />
    </svg>
  );
}

export function XIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.847-8.103-10.653h7.13l4.252 5.623 5.485-5.623zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
