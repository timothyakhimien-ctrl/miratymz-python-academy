import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getAllSchools, saveAllSchools, INITIAL_SCHOOLS, School } from '@/lib/schools';
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

// POST /api/admin/schools - Robust handler for saving, toggling, deleting, or resetting schools
export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await request.json();

    // Support both direct school object { id, name, ... } and nested { action, school }
    const action = body.action || (body.id || body.name ? 'save' : undefined);
    const targetSchool = body.school || (body.id || body.name ? body : undefined);
    const targetId = body.schoolId || body.id || targetSchool?.id;

    const currentSchools = await getAllSchools();

    // 1. SAVE / UPSERT SCHOOL
    if (action === 'save' && targetSchool) {
      const schoolId = targetSchool.id || `school-${Date.now()}`;
      const idx = currentSchools.findIndex((s) => s.id === schoolId);
      const accessCode = (targetSchool.accessCode || '').trim().toUpperCase();
      const accessCodeHash = accessCode ? hashCode(accessCode) : (targetSchool.accessCodeHash || hashCode('SCHOOL-2026'));

      const updatedSchool: School = {
        id: schoolId,
        name: (targetSchool.name || '').trim(),
        address: (targetSchool.address || '').trim(),
        area: (targetSchool.area || 'Isheri Pipeline, Lagos').trim(),
        accessCode: accessCode || (idx >= 0 ? currentSchools[idx].accessCode : 'SCHOOL-2026'),
        accessCodeHash: accessCodeHash || (idx >= 0 ? currentSchools[idx].accessCodeHash : hashCode('SCHOOL-2026')),
        paymentMethod: targetSchool.paymentMethod || (targetSchool.accountNumber ? 'bank_transfer' : 'pending'),
        bankName: targetSchool.bankName || undefined,
        accountName: targetSchool.accountName || undefined,
        accountNumber: targetSchool.accountNumber || undefined,
        paymentInstructions: targetSchool.paymentInstructions || undefined,
        isEnabled: targetSchool.isEnabled !== false,
        hasPaymentConfigured: Boolean(targetSchool.accountNumber && targetSchool.bankName),
        createdAt: idx >= 0 ? currentSchools[idx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!updatedSchool.name) {
        return NextResponse.json({ error: 'School name is required.' }, { status: 400 });
      }

      if (idx >= 0) {
        currentSchools[idx] = updatedSchool;
      } else {
        currentSchools.push(updatedSchool);
      }

      const saved = await saveAllSchools(currentSchools);
      if (!saved) throw new Error('Failed to persist schools update to storage.');

      return NextResponse.json({
        success: true,
        message: `School "${updatedSchool.name}" successfully saved!`,
        school: updatedSchool,
        schools: currentSchools,
      });
    }

    // 2. TOGGLE STATUS (ENABLE / DISABLE)
    if ((action === 'toggle' || action === 'toggle_status') && targetId) {
      const target = currentSchools.find((s) => s.id === targetId);
      if (!target) {
        return NextResponse.json({ error: `School with ID "${targetId}" not found.` }, { status: 404 });
      }

      target.isEnabled = !target.isEnabled;
      target.updatedAt = new Date().toISOString();
      await saveAllSchools(currentSchools);

      return NextResponse.json({
        success: true,
        message: `School "${target.name}" is now ${target.isEnabled ? 'Active' : 'Disabled'}.`,
        school: target,
        schools: currentSchools,
      });
    }

    // 3. DELETE SCHOOL
    if (action === 'delete' && targetId) {
      const filtered = currentSchools.filter((s) => s.id !== targetId);
      if (filtered.length === currentSchools.length) {
        return NextResponse.json({ error: `School with ID "${targetId}" not found.` }, { status: 404 });
      }

      await saveAllSchools(filtered);
      return NextResponse.json({
        success: true,
        message: 'School removed from directory successfully.',
        schools: filtered,
      });
    }

    // 4. RESET TO DEFAULT SCHOOLS
    if (action === 'reset_default') {
      await saveAllSchools(INITIAL_SCHOOLS);
      return NextResponse.json({
        success: true,
        message: 'School directory reset to verified default Isheri Pipeline list.',
        schools: INITIAL_SCHOOLS,
      });
    }

    return NextResponse.json(
      { error: 'Invalid school action. Supported actions: save, toggle, delete, reset_default.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Admin Schools API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error processing school action.' }, { status: 500 });
  }
}
