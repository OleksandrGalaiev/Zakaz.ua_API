import { z } from 'zod'

const overweightPlanSchema = z.object({
    "weight_step": z.number(),
    "max_step_price": z.number(),
    "initial_weight": z.number()
})

const pickupZoneSchema = z.object({
    "zone": z.object({
        "ru": z.string(),
        "en": z.string(),
        "uk": z.string()
    }),
    "name": z.string()
})

const storeSchema = z.object({
    "id": z.string(),
    "name": z.string(),
    "retail_chain": z.string(),
    "region_id": z.string().nullable(),
    "city": z.string().nullable(),
    "delivery_service": z.string(),
    "currency": z.string(),
    "post_code": z.string(),
    "phones": z.array(z.string()),
    "address": z.object({
        "city": z.string(),
        "street": z.string(),
        "building": z.string(),
        "coords": z.object({
            "lat": z.number(),
            "lng": z.number()
        })
    }),
    "email": z.string(),
    "delivery_types": z.array(z.enum(['pickup', 'plan', 'nova_poshta', 'nova_poshta_address'])),
    "payment_types": z.object({
        "pickup": z.array(z.string()).optional(),
        "plan": z.array(z.string()).optional(),
        "nova_poshta": z.array(z.string()).optional(),
        "nova_poshta_address": z.array(z.string()).optional()
    }),
    "payment_types_for_excisable": z.array(z.string()),
    "opening_hours": z.object({
        "from": z.string(),
        "to": z.string()
    }).nullable(),
    "is_active": z.boolean(),
    "overweight_params": z.object({
        "pickup": z.null().optional(),
        "plan": overweightPlanSchema.optional(),
        "nova_poshta": z.null().optional(),
        "nova_poshta_address": z.null().optional()
    }),
    "pickup_zones": z.array(pickupZoneSchema).nullable(),
    "service_fee_percentage": z.number(),
    "tips_available": z.boolean()
})

export const storesJSONSchema = z.array(storeSchema)
