import { NextResponse } from 'next/server';
import { dbService } from '@/lib/supabase';
import { Cutoff, College } from '@/lib/mockDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rows, csvText } = body;

    let parsedRows: any[] = [];

    // Parse CSV Text if provided
    if (csvText) {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple comma split (ignoring quotes for simplicity of code)
        const values = line.split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        
        headers.forEach((header: string, index: number) => {
          row[header] = values[index];
        });
        parsedRows.push(row);
      }
    } else if (rows && Array.isArray(rows)) {
      parsedRows = rows;
    } else {
      return NextResponse.json(
        { error: 'Provide either a JSON array of "rows" or "csvText" string.' },
        { status: 400 }
      );
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: 'No data rows found.' },
        { status: 400 }
      );
    }

    // Load current colleges to avoid duplicates
    const existingColleges = await dbService.getColleges();
    const existingCutoffs = await dbService.getCutoffs();

    const newCollegesCreated: College[] = [];
    const newCutoffsCreated: Cutoff[] = [];
    
    let validatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const lineNum = i + 2;

      // Required fields check
      const required = ['exam', 'year', 'college_name', 'college_code', 'branch', 'category', 'closing_rank'];
      const missing = required.filter(f => !row[f]);

      if (missing.length > 0) {
        errorCount++;
        if (errors.length < 5) {
          errors.push(`Row ${lineNum} missing required fields: ${missing.join(', ')}`);
        }
        continue;
      }

      // Check if college exists, if not create one
      let college = existingColleges.find(
        (c) => c.code.toLowerCase() === row.college_code.toLowerCase() ||
               c.name.toLowerCase() === row.college_name.toLowerCase()
      );

      if (!college) {
        const newCollegeId = `col-${Math.random().toString(36).substring(2, 10)}`;
        college = {
          id: newCollegeId,
          name: row.college_name,
          code: row.college_code.toUpperCase(),
          city: row.city || 'TBD',
          state: row.state || 'TBD',
          type: (row.college_type as any) || 'Autonomous',
          rating: Number(row.rating) || 4.0,
          ranking: Number(row.ranking) || 150,
          fees_median: Number(row.fees) || 120000,
          placements_info: {
            median_ctc_lpa: Number(row.placement_median_lpa) || 6.5,
            highest_ctc_lpa: Number(row.placement_highest_lpa) || 20.0,
            placement_percentage: Number(row.placement_percentage) || 85
          },
          website: row.website || 'https://example.edu',
          description: row.description || `${row.college_name} is a premier engineering college.`,
          image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
        };
        
        // Add to local list and save to DB
        existingColleges.push(college);
        newCollegesCreated.push(college);
        await dbService.updateCollege(college);
      }

      // Prepare cutoff record
      const cutoffId = `cutoff-csv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const cutoffRow: Cutoff = {
        id: cutoffId,
        college_id: college.id,
        exam: row.exam,
        year: Number(row.year),
        branch: row.branch.toUpperCase(),
        category: row.category,
        gender: row.gender || 'Co-Ed',
        quota: row.quota || 'Counseling',
        round: Number(row.round) || 1,
        opening_rank: Number(row.opening_rank) || Math.round(Number(row.closing_rank) * 0.75),
        closing_rank: Number(row.closing_rank),
        fees: row.fees ? Number(row.fees) : college.fees_median
      };

      newCutoffsCreated.push(cutoffRow);
      validatedCount++;
    }

    // Save cutoffs to DB
    if (newCutoffsCreated.length > 0) {
      await dbService.bulkInsertCutoffs(newCutoffsCreated);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: parsedRows.length,
        insertedCutoffs: newCutoffsCreated.length,
        createdColleges: newCollegesCreated.length,
        errorsFound: errorCount,
        sampleErrors: errors
      }
    });

  } catch (error: any) {
    console.error('Error uploading CSV dataset:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
