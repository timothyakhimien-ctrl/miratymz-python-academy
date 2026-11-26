import { NextResponse } from 'next/server';
import { getPublicSchoolDirectory, verifySchoolCode } from '@/lib/schools';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/schools - Public directory of participating schools in Isheri Pipeline (NO CODES RETURNED)
export async function GET() {
  try {
    const schools = await getPublicSchoolDirectory();
    return NextResponse.json(
      {
        success: true,
        schools,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to load schools directory' }, { status: 500 });
  }
}

// POST /api/schools - Verify school access code on server
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schoolId = body.schoolId;
    const accessCode = body.accessCode || body.code;

    const result = await verifySchoolCode(schoolId, accessCode);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Invalid access code for this school.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'School code verified successfully! ₦5,000 discounted student tuition activated.',
      school: result.school,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error verifying access code' }, { status: 500 });
  }
}
