// ════════════════════════════════════════════════════════════
// LegalShell — shared layout for static pages (about, privacy,
// terms, cookies, advertise, contact). Keeps them visually
// consistent and on the v9 light theme.
// ════════════════════════════════════════════════════════════
import styles from '@/styles/content.module.css';

export function LegalShell({
  kicker,
  title,
  updated,
  children,
}: {
  kicker?: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <article className={styles.legal}>
        {kicker && <div className={styles.legalKicker}>{kicker}</div>}
        <h1 className={styles.legalTitle}>{title}</h1>
        {updated && <div className={styles.legalUpdated}>Last updated: {updated}</div>}
        <div className={styles.legalBody}>{children}</div>
      </article>
    </main>
  );
}
