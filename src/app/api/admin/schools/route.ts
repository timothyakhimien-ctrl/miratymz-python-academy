import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllSchools, saveAllSchools, School } from '@/lib/schools';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

// GET /api/admin/schools - Fetch all schools with management details (Protected)
export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const schools = await getAllSchools();
    return NextResponse.json({
      success: true,
      schools,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/schools - Update or add school details, access code, or payment info (Protected)
export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, school } = body;

    const currentSchools = await getAllSchools();

    if (action === 'save' && school && school.id) {
      const idx = currentSchools.findIndex((s) => s.id === school.id);
      const accessCode = (school.accessCode || '').trim().toUpperCase();
      const accessCodeHash = accessCode ? hashCode(accessCode) : school.accessCodeHash;

      const updatedSchool: School = {
        ...school,
        accessCode: accessCode || (idx >= 0 ? currentSchools[idx].accessCode : 'SCHOOL-2026'),
        accessCodeHash: accessCodeHash || (idx >= 0 ? currentSchools[idx].accessCodeHash : hashCode('SCHOOL-2026')),
        hasPaymentConfigured: Boolean(school.accountNumber && school.bankName),
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        currentSchools[idx] = updatedSchool;
      } else {
        currentSchools.push({
          ...updatedSchool,
          createdAt: new Date().toISOString(),
        });
      }

      const saved = await saveAllSchools(currentSchools);
      if (!saved) throw new Error('Failed to persist schools update to storage.');

      return NextResponse.json({
        success: true,
        message: `School "${updatedSchool.name}" successfully updated!`,
        school: updatedSchool,
      });
    }

    if (action === 'toggle_status' && school && school.id) {
      const target = currentSchools.find((s) => s.id === school.id);
      if (target) {
        target.isEnabled = !target.isEnabled;
        target.updatedAt = new Date().toISOString();
        await saveAllSchools(currentSchools);
        return NextResponse.json({
          success: true,
          message: `School "${target.name}" registration ${target.isEnabled ? 'enabled' : 'disabled'}.`,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid school action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
