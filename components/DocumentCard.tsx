'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { validateURL } from '@/lib/zod/validation';

import { Card, CardContent } from '@/components/ui/card';

interface DocumentCardProps {
  result: Record<string, any>;
}

const isImageUrl = (url: string): boolean => {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);
};

interface ResultFieldProps {
  field: string;
  value: any;
}

const ResultField: React.FC<ResultFieldProps> = ({ field, value }) => {
  const renderContent = () => {
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <span>{value.join(', ')}</span>
      ) : (
        <span className="text-gray-400 italic">No items</span>
      );
    }

    if (typeof value === 'string') {
      if (value.trim() === '') {
        return <span className="text-gray-400 italic">Empty</span>;
      }
      if (validateURL(value).valid) {
        if (isImageUrl(value)) {
          return (
            <>
              <Image
                src={value}
                alt={field}
                width={200}
                height={200}
                className="mt-2 rounded-md"
              />
              <div className="mt-2 break-words">
                <Link
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline inline-flex"
                >
                  <span className="break-all">{value}</span>
                </Link>
              </div>
            </>
          );
        }
        return (
          <Link
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex  break-all"
          >
            <span className="mr-1">{value}</span>
          </Link>
        );
      }
      return <span dangerouslySetInnerHTML={{ __html: value }} />;
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not available</span>;
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="mb-4">
      <span className="font-semibold text-base block mb-2">{field}</span>
      <div className="">{renderContent()}</div>
    </div>
  );
};

const DocumentCard: React.FC<DocumentCardProps> = ({ result }) => {
  const sortedEntries = Object.entries(result).sort(([keyA], [keyB]) => {
    if (keyA === 'id') return -1;
    if (keyB === 'id') return 1;
    if (
      keyA === 'created_at' ||
      keyA === 'createdAt' ||
      keyA === 'updated_at' ||
      keyA === 'updatedAt'
    )
      return 1;
    if (
      keyB === 'created_at' ||
      keyB === 'createdAt' ||
      keyB === 'updated_at' ||
      keyB === 'updatedAt'
    )
      return -1;

    return 0;
  });

  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <div className="space-y-2">
          {sortedEntries.map(([key, value]) => (
            <ResultField key={key} field={key} value={value} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
