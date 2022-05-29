// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './../../../db'

type CategoryResponse = {
    // TODO: add fields
}

type DefaultResponse = {}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CategoryResponse|DefaultResponse>
) {

    let id = req.query.id.toString()

    id = encodeURIComponent(id)

    if(id){

        const categoryResults = await prisma.tool_categories.findMany({
            where: {
                category_id: parseInt(id)
            },
            include: {
                tools: true,
            },
        });
    
        const categoryData = await prisma.categories.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                category_name: true,
                category_icon: true,
                category_description: true
            }
        });

        return res.status(200).json({categoryData, categoryResults});

    }

    return res.status(200).json({})

}