import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const useQueryParams = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();


    const queryParams = useMemo(
        () => Object.fromEntries(searchParams.entries()),
        [searchParams],
    );


    const buildNewUrl = useCallback(
        (updatedSearchParams: URLSearchParams) => {
            const queryString = updatedSearchParams.toString();
            return `${pathname}${queryString ? '?' + queryString : ''}`;
        },
        [pathname],
    );


    const setQueryParam = useCallback(
        (key: string, value: string) => {
            const updatedSearchParams = new URLSearchParams(searchParams);
            updatedSearchParams.set(key, value);
            const newUrl = buildNewUrl(updatedSearchParams);
            router.push(newUrl);
        },
        [searchParams, router, buildNewUrl],
    );


    const setQueryParams = useCallback(
        (newQueryParams: Record<string, string>) => {
            if (
                typeof newQueryParams !== 'object' ||
                newQueryParams === null ||
                Array.isArray(newQueryParams)
            ) {
                throw new Error('setQueryParams expects a plain object.');
            }
            const updatedSearchParams = new URLSearchParams(searchParams);
            Object.entries(newQueryParams).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    updatedSearchParams.delete(key);
                } else {
                    updatedSearchParams.set(key, value);
                }
            });
            const newUrl = buildNewUrl(updatedSearchParams);
            router.push(newUrl);
        },
        [searchParams, router, buildNewUrl],
    );


    const deleteQueryParam = useCallback(
        (key: string) => {
            const updatedSearchParams = new URLSearchParams(searchParams);
            updatedSearchParams.delete(key);
            const newUrl = buildNewUrl(updatedSearchParams);
            router.push(newUrl);
        },
        [searchParams, router, buildNewUrl],
    );


    const deleteQueryParams = useCallback(
        (keys: string[]) => {
            if (!Array.isArray(keys)) {
                throw new Error('deleteQueryParams expects an array of keys.');
            }
            const updatedSearchParams = new URLSearchParams(searchParams);
            keys.forEach((key) => updatedSearchParams.delete(key));
            const newUrl = buildNewUrl(updatedSearchParams);
            router.push(newUrl);
        },
        [searchParams, router, buildNewUrl],
    );


    const clearQueryParams = useCallback(() => {
        const updatedSearchParams = new URLSearchParams();
        const newUrl = buildNewUrl(updatedSearchParams);
        router.push(newUrl);
    }, [router, buildNewUrl]);

    return {
        queryParams,
        setQueryParam,
        setQueryParams,
        deleteQueryParam,
        deleteQueryParams,
        clearQueryParams,
    };
};

export default useQueryParams;
