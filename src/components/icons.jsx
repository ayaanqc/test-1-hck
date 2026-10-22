// Small stroke icon set. No icon library, no image files: a few hundred bytes each.
const P = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  report:
    'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Zm12.5-3.5a5 5 0 0 1 0 9M18.5 4a9 9 0 0 1 0 16',
  track: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.6-1.9L21 21',
  scale:
    'M12 3v18M7 21h10M5 7h14M5 7 2 14h6L5 7Zm14 0-3 7h6l-3-7Z',
  archive: 'M3 7h18M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M4 3h16v4H4V3Zm6 8h4',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M3 13 6 4h12l3 9v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3Zm-3.2 9 2.4 2.4 4.2-4.6',
  sliders: 'M4 7h9m4 0h3M4 17h4m4 0h8M13 4.5v5M8 14.5v5',
  settings:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5c0-.6-.1-1.2-.2-1.7l2-1.5-2-3.4-2.3.9a8 8 0 0 0-2.9-1.7L14.2 2h-4l-.4 2.3a8 8 0 0 0-2.9 1.7l-2.3-.9-2 3.4 2 1.5a8.6 8.6 0 0 0 0 3.4l-2 1.5 2 3.4 2.3-.9a8 8 0 0 0 2.9 1.7l.4 2.3h4l.4-2.3a8 8 0 0 0 2.9-1.7l2.3.9 2-3.4-2-1.5c.1-.5.2-1.1.2-1.7Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  phone: 'M6.6 3h3l1.5 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z',
  check: 'M4 12.5 9 17.5 20 6.5',
  alert: 'M12 4 2.8 20h18.4L12 4Zm0 5v5.5M12 17.6v.4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.5V12l3.2 2',
  arrowRight: 'M4 12h16M14 6l6 6-6 6',
  arrowLeft: 'M20 12H4M10 6l-6 6 6 6',
  lock: 'M6 10h12v10H6V10Zm3 0V7.5a3 3 0 0 1 6 0V10M12 14v2',
  file: 'M7 3h7l4 4v14H7V3Zm7 0v4h4M10 12h6M10 16h6',
  plus: 'M12 5v14M5 12h14',
  print: 'M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7v-7Z',
  mic: 'M12 15a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5.5A3.5 3.5 0 0 0 12 15Zm-7-3.5a7 7 0 0 0 14 0M12 18.5V22',
  stop: 'M7 7h10v10H7z',
  play: 'M8 5.5 18 12 8 18.5v-13Z',
  edit: 'M4 20h4l10-10-4-4L4 16v4Zm10-14 4 4',
  users: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 8a6 6 0 0 1 12 0M16 5.5a3.5 3.5 0 0 1 0 6.6M18 20a6 6 0 0 0-2-4.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c3-2.6 4.5-5.6 4.5-9S15 5.6 12 3c-3 2.6-4.5 5.6-4.5 9s1.5 6.4 4.5 9ZM3.5 12h17',
  chevronDown: 'M6 9.5 12 15.5l6-6',
  chevronRight: 'M9.5 6 15.5 12l-6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  flag: 'M6 21V4h12l-2.5 4L18 12H6',
  wallet: 'M3 8a2 2 0 0 1 2-2h14v12H5a2 2 0 0 1-2-2V8Zm0 0v8m18-6h-4a2 2 0 0 0 0 4h4',
  bell: 'M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2.2 2.2 0 0 0 4 0',
  download: 'M12 4v11m0 0 4-4m-4 4-4-4M4 19h16',
  spark: 'M12 3.5 13.7 9l5.3 1.7L13.7 12.5 12 18l-1.7-5.5L5 10.7 10.3 9 12 3.5Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.4v.2M12 11v6',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
}

export const ICON_NAMES = Object.keys(P)

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.7, title }) {
  const path = P[name]
  if (!path) return null
  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  )
}
