'use client';
// ════════════════════════════════════════════════════════════
// ScrollReveal — mounts the same IntersectionObserver the v9 script
// used: any element with .rv / .rl / .rr gets .in when it enters the
// viewport. Re-scans on route changes so newly rendered cards animate.
// ════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.rv, .rl, .rr')
    ).filter((el) => !el.classList.contains('in'));

    // Honour reduced-motion: reveal everything immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -28px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
