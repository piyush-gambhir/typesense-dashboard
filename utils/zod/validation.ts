import { z } from 'zod';

import {
    audioFileTypes,
    imageFileTypes,
    videoFileTypes,
} from '@/utils/zod/file-types';


const emailSchema = z.string().email({ message: 'Invalid email address' });


const urlSchema = z.string().url({ message: 'Invalid URL' });


const stringSchema = z.string().min(1, { message: 'String cannot be empty' });


const numberSchema = z.number().min(0, { message: 'Number must be positive' });


const integerSchema = z.number().int({ message: 'Value must be an integer' });


const dateSchema = z.date({ message: 'Invalid date' });


const stringArraySchema = z.array(z.string(), {
    message: 'Array must contain strings',
});










const passwordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(16, { message: 'Password must be no more than 16 characters long' })
    .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
    })
    .regex(/\d/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&]/, {
        message:
            'Password must contain at least one special character (@, $, !, %, *, ?, &)',
    });


const createImageFileSchema = (maxFileSize: number, allowedTypes: string[]) =>
    z.object({
        type: z.string().refine((type) => allowedTypes.includes(type), {
            message: `Invalid image type. Only ${allowedTypes.join(', ')} are allowed.`,
        }),
        size: z.number().refine((size) => size <= maxFileSize, {
            message: `File size should be less than ${maxFileSize / (1024 * 1024)} MB.`,
        }),
    });


const createVideoFileSchema = (maxFileSize: number, allowedTypes: string[]) =>
    z.object({
        type: z.string().refine((type) => allowedTypes.includes(type), {
            message: `Invalid video type. Only ${allowedTypes.join(', ')} are allowed.`,
        }),
        size: z.number().refine((size) => size <= maxFileSize, {
            message: `File size should be less than ${maxFileSize / (1024 * 1024)} MB.`,
        }),
    });


const createAudioFileSchema = (maxFileSize: number, allowedTypes: string[]) =>
    z.object({
        type: z.string().refine((type) => allowedTypes.includes(type), {
            message: `Invalid audio type. Only ${allowedTypes.join(', ')} are allowed.`,
        }),
        size: z.number().refine((size) => size <= maxFileSize, {
            message: `File size should be less than ${maxFileSize / (1024 * 1024)} MB.`,
        }),
    });


const createPDFFileSchema = (maxFileSize: number, allowedTypes: string[]) =>
    z.object({
        type: z.string().refine((type) => allowedTypes.includes(type), {
            message: `Invalid PDF type. Only ${allowedTypes.join(', ')} are allowed.`,
        }),
        size: z.number().refine((size) => size <= maxFileSize, {
            message: `File size should be less than ${maxFileSize / (1024 * 1024)} MB.`,
        }),
    });


export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});


export function validateEmail(email: string) {
    try {
        emailSchema.parse(email);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateURL(url: string) {
    try {
        urlSchema.parse(url);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateString(str: string) {
    try {
        stringSchema.parse(str);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateNumber(num: number) {
    try {
        numberSchema.parse(num);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateInteger(num: number) {
    try {
        integerSchema.parse(num);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateDate(date: Date) {
    try {
        dateSchema.parse(date);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateStringArray(arr: string[]) {
    try {
        stringArraySchema.parse(arr);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validatePassword(password: string) {
    try {
        passwordSchema.parse(password);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}















export function validateImageFile({
    imageFile,
    maxFileSize = 5 * 1024 * 1024,
    allowedTypes = imageFileTypes,
}: {
    imageFile: { type: string; size: number };
    maxFileSize?: number;
    allowedTypes?: string[];
}) {
    try {
        createImageFileSchema(maxFileSize, allowedTypes).parse(imageFile);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateVideoFile({
    videoFile,
    maxFileSize = 100 * 1024 * 1024,
    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'],
}: {
    videoFile: { type: string; size: number };
    maxFileSize?: number;
    allowedTypes?: string[];
}) {
    try {
        createVideoFileSchema(maxFileSize, allowedTypes).parse(videoFile);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validatePDFFile({
    pdfFile,
    maxFileSize = 10 * 1024 * 1024,
    allowedTypes = ['application/pdf'],
}: {
    pdfFile: { type: string; size: number };
    maxFileSize?: number;
    allowedTypes?: string[];
}) {
    try {
        createPDFFileSchema(maxFileSize, allowedTypes).parse(pdfFile);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}


export function validateAudioFile({
    audioFile,
    maxFileSize = 50 * 1024 * 1024,
    allowedTypes = audioFileTypes,
}: {
    audioFile: { type: string; size: number };
    maxFileSize?: number;
    allowedTypes?: string[];
}) {
    try {
        createAudioFileSchema(maxFileSize, allowedTypes).parse(audioFile);
        return { valid: true, message: '' };
    } catch (e) {
        if (
            e instanceof z.ZodError &&
            'errors' in e &&
            Array.isArray(e.errors) &&
            e.errors.length > 0
        ) {
            return { valid: false, message: e.errors[0].message };
        }
        return { valid: false, message: 'An error occurred during validation' };
    }
}
