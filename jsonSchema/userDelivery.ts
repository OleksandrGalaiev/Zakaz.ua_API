import {z} from 'zod'

export const userDeliveryJSONSchema = z.object({
    "delivery":z.object({
        "type": z.string(),
        "address":z.object({
            "plan":z.object({
                "type": z.string(),
                "city": z.string(),
                "street": z.string(),
                "building": z.string(),
                "floor": z.string(),
                "room": z.string(),
                "company_name": z.null(),
                "block": z.string().nullable(),
                "entrance": z.string(),
                "id": z.string(),
                "entrance_code": z.string(),
                "elevator": z.boolean(),
                "comments": z.string(),
                "coords":z.object({
                    "lng": z.number(),
                    "lat": z.number()
                }),
                "region_id": z.string(),
                "delivery_service_id": z.string()
            }),
            "pickup": z.null(),
            "nova_poshta": z.null(),
            "nova_poshta_fresh": z.null(),
            "nova_poshta_address": z.null()
        }),
        "hash": z.string()
    })
})