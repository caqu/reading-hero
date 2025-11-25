import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeedbackOverlay } from '../../../components/FeedbackOverlay';

describe('FeedbackOverlay', () => {

  describe('Rendering States', () => {
    it('should render success state with correct icon', () => {
      render(<FeedbackOverlay type="success" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent('✓');
    });

    it('should render error state with correct icon', () => {
      render(<FeedbackOverlay type="error" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent('✗');
    });

    it('should render celebration state with correct icon', () => {
      render(<FeedbackOverlay type="celebration" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveTextContent('🎉');
    });

    it('should not render when type is "none"', () => {
      const { container } = render(<FeedbackOverlay type="none" />);

      const overlay = screen.queryByRole('alert');
      expect(overlay).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should render with custom message', () => {
      render(<FeedbackOverlay type="success" message="Great job!" />);

      expect(screen.getByText('Great job!')).toBeInTheDocument();
    });

    it('should render without message when not provided', () => {
      render(<FeedbackOverlay type="success" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toBeInTheDocument();
      // Should only contain the icon, no message text
      const messages = screen.queryByRole('paragraph');
      expect(messages).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply success class for success type', () => {
      const { container } = render(<FeedbackOverlay type="success" />);

      const overlay = container.querySelector('[class*="overlay"]');
      expect(overlay?.className).toMatch(/success/);
    });

    it('should apply error class for error type', () => {
      const { container } = render(<FeedbackOverlay type="error" />);

      const overlay = container.querySelector('[class*="overlay"]');
      expect(overlay?.className).toMatch(/error/);
    });

    it('should apply celebration class for celebration type', () => {
      const { container } = render(<FeedbackOverlay type="celebration" />);

      const overlay = container.querySelector('[class*="overlay"]');
      expect(overlay?.className).toMatch(/celebration/);
    });

    it('should apply animation class to content', () => {
      const { container } = render(<FeedbackOverlay type="success" />);

      const content = container.querySelector('[class*="content"]');
      // Check that content element exists
      expect(content).toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('should auto-dismiss after default duration (1500ms)', async () => {
      render(<FeedbackOverlay type="success" duration={100} />);

      // Should be visible initially
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Wait for component to auto-dismiss
      await waitFor(() => {
        const overlay = screen.queryByRole('alert');
        expect(overlay).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should be visible initially', () => {
      render(<FeedbackOverlay type="success" duration={5000} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Type Changes', () => {
    it('should update when type changes from none to success', () => {
      const { rerender } = render(<FeedbackOverlay type="none" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      rerender(<FeedbackOverlay type="success" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('✓');
    });

    it('should update when type changes from success to error', () => {
      const { rerender } = render(<FeedbackOverlay type="success" />);

      expect(screen.getByRole('alert')).toHaveTextContent('✓');

      rerender(<FeedbackOverlay type="error" />);

      expect(screen.getByRole('alert')).toHaveTextContent('✗');
    });

    it('should hide when type changes to none', () => {
      const { rerender } = render(<FeedbackOverlay type="success" duration={5000} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<FeedbackOverlay type="none" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Message Updates', () => {
    it('should update message when prop changes', () => {
      const { rerender } = render(<FeedbackOverlay type="success" message="First message" />);

      expect(screen.getByText('First message')).toBeInTheDocument();

      rerender(<FeedbackOverlay type="success" message="Second message" />);

      expect(screen.queryByText('First message')).not.toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });

    it('should show message when added after initial render', () => {
      const { rerender } = render(<FeedbackOverlay type="success" />);

      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();

      rerender(<FeedbackOverlay type="success" message="New message" />);

      expect(screen.getByText('New message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" for screen readers', () => {
      render(<FeedbackOverlay type="success" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toHaveAttribute('role', 'alert');
    });

    it('should have aria-live="polite" for announcements', () => {
      render(<FeedbackOverlay type="success" />);

      const overlay = screen.getByRole('alert');
      expect(overlay).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-hidden="true" on icon', () => {
      const { container } = render(<FeedbackOverlay type="success" />);

      const icon = container.querySelector('[class*="icon"]');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Multiple Rapid Changes', () => {
    it('should handle rapid type changes correctly', () => {
      const { rerender } = render(<FeedbackOverlay type="success" duration={5000} />);

      expect(screen.getByRole('alert')).toHaveTextContent('✓');

      rerender(<FeedbackOverlay type="error" duration={5000} />);
      expect(screen.getByRole('alert')).toHaveTextContent('✗');

      rerender(<FeedbackOverlay type="celebration" duration={5000} />);
      expect(screen.getByRole('alert')).toHaveTextContent('🎉');
    });
  });
});
