import {z} from "zod"

export const userProfileJSONSchema = z.object({
    "login":z.object({
        "phone": z.string()
    }),
    "phones":z.array(
        z.object({
            "phone": z.string(),
            "is_editable": z.boolean()
        })
    ),
    "emails":z.array(
        z.object({
            "email": z.string(),
            "is_editable": z.boolean()
        })
    ),
    "name": z.string(),
    "surname": z.string().nullable(),
    "birthdate": z.null(),
    "last_visit": z.string(),
    "meta_user_id": z.string(),
    "subscribed_to_marketing": z.boolean(),
    "has_delivery_presets": z.boolean(),
    "has_referral_coupon": z.boolean(),
    "is_horeca": z.boolean(),
    "delivered_orders_count": z.number(),
    "all_chains_delivered_orders_count": z.number(),
    "subscriptions": z.object({
        "products_availability": z.boolean(),
        "products_discounts": z.boolean(),
        "marketing": z.boolean(),
        "recommendations": z.boolean()
    }),
    "need_update_policy": z.boolean()
})