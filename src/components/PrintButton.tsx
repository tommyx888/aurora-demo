import { motion } from 'framer-motion';
import { Printer, Download, FileText } from 'lucide-react';

interface PrintButtonProps {
  /** Title of the document (used in print header) */
  title?: string;
  /** Subtitle / context line */
  subtitle?: string;
  /** Optional className */
  className?: string;
  /** Variant style */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Optional callback before print (e.g. expand all collapsed nodes) */
  beforePrint?: () => void;
  /** Show as compact icon only */
  iconOnly?: boolean;
}

/**
 * Print button — triggers browser native print dialog.
 * The print stylesheet (in index.css) handles formatting:
 * - Hides sidebar, theme switcher, chatbot, CTAs
 * - Adds page break hints
 * - Optimizes colors for print
 */
export function PrintButton({
  title,
  subtitle,
  className = '',
  variant = 'secondary',
  beforePrint,
  iconOnly = false,
}: PrintButtonProps) {
  const handlePrint = async () => {
    // Set print metadata via document title (browser uses it as PDF filename)
    const originalTitle = document.title;
    if (title) document.title = title;

    // Set print metadata in body data attrs (read by print stylesheet)
    if (title) document.body.setAttribute('data-print-title', title);
    if (subtitle) document.body.setAttribute('data-print-subtitle', subtitle);

    if (beforePrint) {
      beforePrint();
      // Give DOM time to update
      await new Promise((r) => setTimeout(r, 100));
    }

    window.print();

    // Restore
    document.title = originalTitle;
    document.body.removeAttribute('data-print-title');
    document.body.removeAttribute('data-print-subtitle');
  };

  const baseClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'ghost'
      ? 'btn-ghost'
      : 'btn-secondary';

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={handlePrint}
      className={`${baseClass} text-sm ${className}`}
      title="Vytlacit / Ulozit ako PDF"
    >
      <Printer size={14} />
      {!iconOnly && <span>Print / PDF</span>}
    </motion.button>
  );
}
