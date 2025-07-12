import { Metadata } from 'next';
import NLSearchTest from '@/components/NLSearchTest';

export const metadata: Metadata = {
  title: 'Natural Language Search Test - Typesense Dashboard',
  description: 'Test and debug natural language search queries',
};

export default function NLSearchTestPage() {
  return <NLSearchTest />;
} 