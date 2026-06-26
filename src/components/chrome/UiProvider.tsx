'use client';
// ════════════════════════════════════════════════════════════
// UiProvider — single source of truth for cross-component chrome
// state: which modal is open, and whether the mobile menu is open.
// Lets the navbar, footer, AI fab and modals all talk to each other
// without prop-drilling, mirroring the original global JS handlers.
// ════════════════════════════════════════════════════════════
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ModalId = 'ai' | 'login' | 'signup' | null;

interface UiState {
  modal: ModalId;
  menuOpen: boolean;
  openModal: (id: Exclude<ModalId, null>) => void;
  closeModal: () => void;
  switchModal: (id: Exclude<ModalId, null>) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalId>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = useCallback((id: Exclude<ModalId, null>) => {
    setMenuOpen(false);
    setModal(id);
  }, []);
  const closeModal = useCallback(() => setModal(null), []);
  const switchModal = useCallback((id: Exclude<ModalId, null>) => setModal(id), []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Lock body scroll when the menu or a modal is open (matches v9 behaviour).
  useEffect(() => {
    const locked = menuOpen || modal !== null;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, modal]);

  // Esc closes whatever is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(
    () => ({ modal, menuOpen, openModal, closeModal, switchModal, toggleMenu, closeMenu }),
    [modal, menuOpen, openModal, closeModal, switchModal, toggleMenu, closeMenu]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiState {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within <UiProvider>');
  return ctx;
}
