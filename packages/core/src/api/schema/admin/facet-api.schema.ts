import z from 'zod';
import { ID } from '../common/common-types.schema';
import { LanguageCode } from '../common/language-code.schema';

export const CreateFacetValueWithFacetInput = z.object({
    code: z.string(),
    name: z.string(),
});

export const FacetTranslationInput = z.object({
    id: ID.optional(),
    languageCode: LanguageCode,
    name: z.string().optional(),
});

export const CreateFacetInput = z.object({
    code: z.string(),
    translations: z.array(FacetTranslationInput),
    values: z.array(CreateFacetValueWithFacetInput).optional(),
});

export const UpdateFacetInput = z.object({
    id: ID,
    code: z.string().optional(),
    translations: z.array(FacetTranslationInput).optional(),
});

export const FacetValueTranslationInput = z.object({
    id: ID.optional(),
    languageCode: LanguageCode,
    name: z.string().optional(),
});

export const CreateFacetValueInput = z.object({
    code: z.string(),
    facetId: ID,
    translations: z.array(FacetValueTranslationInput),
});

export const UpdateFacetValueInput = z.object({
    id: ID,
    code: z.string().optional(),
    translations: z.array(FacetValueTranslationInput).optional(),
});

export const MutationCreateFacetArgs = z.object({
    input: CreateFacetInput,
});

export const MutationUpdateFacetArgs = z.object({
    input: UpdateFacetInput,
});

export const MutationCreateFacetValuesArgs = z.object({
    input: z.array(CreateFacetValueInput),
});

export const MutationUpdateFacetValuesArgs = z.object({
    input: z.array(UpdateFacetValueInput),
});
