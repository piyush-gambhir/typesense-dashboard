import { Metadata } from 'next';
import React from 'react';

import NLSearchTest from '@/components/features/search/nl-search-test';

export const metadata: Metadata = {
    title: 'Natural Language Search Test - Typesense Dashboard',
    description: 'Test and debug natural language search queries',
};

export default function NLSearchTestPage() {
    return <NLSearchTest />;
}
