import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const categories = await prisma.timeEntryCategory.findMany({
            where: {
                projectId: projectId
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching time categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch time categories' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await request.json()

        const { name, color, isDefault } = body

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            )
        }

        // Check if category with same name already exists
        const existingCategory = await prisma.timeEntryCategory.findFirst({
            where: {
                projectId: projectId,
                name: name
            }
        })

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 400 }
            )
        }

        // If this is being set as default, unset other defaults
        if (isDefault) {
            await prisma.timeEntryCategory.updateMany({
                where: {
                    projectId: projectId,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            })
        }

        // Create the category
        const category = await prisma.timeEntryCategory.create({
            data: {
                projectId,
                name,
                color: color || null,
                isDefault: isDefault || false
            }
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating time category:', error)
        return NextResponse.json(
            { error: 'Failed to create time category' },
            { status: 500 }
        )
    }
} 