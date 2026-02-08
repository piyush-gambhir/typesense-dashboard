'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const Link: typeof NextLink = (({ children, ...props }) => {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (props.prefetch === false) return;

        const linkElement = linkRef.current;
        if (!linkElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    prefetchTimeoutRef.current = setTimeout(() => {
                        router.prefetch(String(props.href));
                        observer.unobserve(entry.target);
                    }, 300);
                } else if (prefetchTimeoutRef.current) {
                    clearTimeout(prefetchTimeoutRef.current);
                    prefetchTimeoutRef.current = null;
                }
            },
            { rootMargin: '0px', threshold: 0.1 },
        );

        observer.observe(linkElement);

        return () => {
            observer.disconnect();
            if (prefetchTimeoutRef.current) {
                clearTimeout(prefetchTimeoutRef.current);
            }
        };
    }, [props.href, props.prefetch, router]);

    return (
        <NextLink
            ref={linkRef}
            prefetch={false}
            onMouseEnter={() => {
                router.prefetch(String(props.href));
            }}
            {...props}
        >
            {children}
        </NextLink>
    );
}) as typeof NextLink;

export default Link;
