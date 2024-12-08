// Local Font
import localFont from 'next/font/local';

export const NeueMontreal = localFont({
  src: [
    {
      path: './PPNeueMontreal/PPNeueMontreal-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './PPNeueMontreal/PPNeueMontreal-Book.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './PPNeueMontreal/PPNeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './PPNeueMontreal/PPNeueMontreal-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './PPNeueMontreal/PPNeueMontreal-SemiBolditalic.woff2',
      weight: '600',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--display',
});
