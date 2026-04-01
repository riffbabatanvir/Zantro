import { useState, useEffect } from 'react';

export interface Announcement {
  text: string;
  enabled: boolean;
  bgColor: string;
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch('/api/announcement')
      .then(r => r.json())
      .then(data => { if (data.enabled && data.text) setAnnouncement(data); })
      .catch(() => {});
  }, []);

  return announcement;
}
