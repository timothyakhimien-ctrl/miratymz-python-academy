import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: files } = await supabase.storage.from('receipts').list();
    
    // Find all files matching python_course_guide
    const guideFiles = files?.filter((f: any) => f.name.includes('python_course_guide')) || [];
    let targetFileName = 'latest_python_course_guide.pdf';
    
    if (guideFiles.length > 0) {
      // Sort newest first by created_at or name
      guideFiles.sort((a: any, b: any) => {
        const dateA = a.created_at || a.name;
        const dateB = b.created_at || b.name;
        return dateB.localeCompare(dateA);
      });
      targetFileName = guideFiles[0].name;
    }

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(targetFileName);
    return NextResponse.redirect(urlData.publicUrl);
  } catch (err: any) {
    return NextResponse.redirect(
      'https://snzrlptwqswaviweehbh.supabase.co/storage/v1/object/public/receipts/latest_python_course_guide.pdf'
    );
  }
}
