/**
 * Hamburger Button
 *
 * Universal menu button that appears on all screens and screen sizes.
 * Clicking it toggles the navigation drawer.
 */

import { useDrawer } from '../contexts/DrawerContext';
import styles from './HamburgerButton.module.css';

export const HamburgerButton = () => {
  const { toggleDrawer, isDrawerOpen } = useDrawer();

  return (
    <button
      className={`${styles.hamburger} ${isDrawerOpen ? styles.open : ''}`}
      onClick={toggleDrawer}
      aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isDrawerOpen}
    >
      <span className={styles.line}></span>
      <span className={styles.line}></span>
      <span className={styles.line}></span>
    </button>
  );
};
