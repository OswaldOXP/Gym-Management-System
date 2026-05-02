function IconShell({ children, size = 18, className = '', strokeWidth = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {children(strokeWidth)}
    </svg>
  )
}

export function DumbbellIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <path d="M7 9v6M17 9v6M4 10v4M20 10v4M7 12h10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    )}</IconShell>
  )
}

export function ChartIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M4 19h16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M7 15v-4M12 15V7M17 15v-7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function CardIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M3.5 10h17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function CalendarIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function ShieldIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <path d="M12 3 19 6v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    )}</IconShell>
  )
}

export function MobileIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <rect x="6.5" y="3.5" width="11" height="17" rx="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M10 17h4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function SearchIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function TrashIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M4 7h16" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      </>
    )}</IconShell>
  )
}

export function BellIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M15 17H5l1.4-1.6A3.8 3.8 0 0 0 7 13V10a5 5 0 1 1 10 0v3c0 .7.3 1.4.6 1.9L19 17h-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.2 19a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function UsersIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth={strokeWidth} />
        <path d="M3 20c.7-3 3-5 5-5s4.3 2 5 5M13 20c.7-3 3-5 5-5s4.3 2 5 5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function WarningIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
        <path d="M12 9v4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <circle cx="12" cy="16.2" r=".9" fill="currentColor" />
      </>
    )}</IconShell>
  )
}

export function FireIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <path d="M13.5 3.5c.4 2.4-.7 4-2 5.2-1.3 1.2-2.7 2.1-2.7 4.1 0 1.8 1.4 3.2 3.2 3.2 2.1 0 3.7-1.5 3.7-3.8 0-1.7-.8-3-1.7-4.2-.8-1-.8-2.2-.5-4.5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    )}</IconShell>
  )
}

export function CheckIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <path d="M4.5 12.5 9 17l10-10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    )}</IconShell>
  )
}

export function AppleIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <path d="M14.5 3.5c-.9.1-2 .8-2.5 1.8-.5.9-.9 2.1-.7 3.2 1.1.1 2.3-.6 2.9-1.4.6-.8 1-2 .3-3.6Zm-1.1 5.3c-1.5 0-2.2.8-3.2.8-1 0-1.7-.8-3-.8-2.1 0-4 1.9-4 5.2 0 3.6 2.6 7 5 7 1.1 0 1.8-.7 3-.7s1.7.7 2.9.7c1.5 0 2.7-1 3.8-2.7-.8-.5-1.9-1.9-1.9-3.8 0-2.2 1.3-3.2 1.8-3.6-.9-1.3-2.1-1.9-3.4-1.9Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
    )}</IconShell>
  )
}

export function BagIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M7 8V7a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M5.5 8h13l-1 10a2 2 0 0 1-2 1.8H8.5A2 2 0 0 1 6.5 18L5.5 8Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      </>
    )}</IconShell>
  )
}

export function ChatBubbleIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5A3.5 3.5 0 0 1 15.5 15H10l-4 3v-3A3.5 3.5 0 0 1 2.5 11.5v-5Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
        <path d="M8 8.5h8M8 11h5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    )}</IconShell>
  )
}

export function MapPinIcon(props) {
  return (
    <IconShell {...props}>{strokeWidth => (
      <>
        <path d="M12 21s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
      </>
    )}</IconShell>
  )
}
