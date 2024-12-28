import { z } from "zod";

export const insertItemSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters in length"),
    description: z.string().optional(),
});

export const selectItemSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const insertRoleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters in length"),
    description: z.string().optional(),
});

export const selectRoleSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const insertUserSchema = z.object({
    username: z.string(),
    email: z.string().email({
        required_error: "Email is required.",
        invalid_type_error: "Email is not valid.",
    }),
    roles: z.array(z.string()).optional(),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    verifiedEmail: z.boolean().optional(),
});

export const selectUserSchema = z.object({
    _id: z.string(),
    username: z.string(),
    email: z.string(),
    roles: z.array(selectRoleSchema),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    verifiedEmail: z.boolean(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const patchItemSchema = insertItemSchema.partial();
export const patchRoleSchema = insertRoleSchema.partial();
export const patchUserSchema = insertUserSchema.partial();
