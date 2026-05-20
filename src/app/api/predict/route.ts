import { NextResponse } from 'next/server';
import { dbService } from '@/lib/supabase';
import { predictColleges, PredictorInputs } from '@/lib/predictor-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      exam,
      rank,
      category,
      gender = 'Co-Ed',
      preferredBranch = 'All',
      preferredLocation = 'All',
      budget = 0,
      collegeType = 'All',
      userEmail = 'student@example.com' // Fallback for session-less/mock users
    } = body;

    if (!exam || !rank || !category) {
      return NextResponse.json(
        { error: 'Missing required parameters: exam, rank, category' },
        { status: 400 }
      );
    }

    // 1. Fetch user profile to check premium status
    const profile = await dbService.getCurrentUser(userEmail);
    const isPremium = profile.is_premium;

    // 2. Fetch data from DB (with Mock fallback)
    const colleges = await dbService.getColleges();
    const cutoffs = await dbService.getCutoffs();

    // 3. Compute predictions
    const inputs: PredictorInputs = {
      exam,
      rank: Number(rank),
      category,
      gender,
      preferredBranch,
      preferredLocation,
      budget: budget ? Number(budget) : undefined,
      collegeType
    };

    const { predictions: rawPredictions, isRelaxed, relaxedReason } = predictColleges(inputs, cutoffs, colleges);

    // 4. Record prediction in history
    await dbService.savePrediction({
      userId: profile.id,
      exam,
      rank: Number(rank),
      category,
      branch: preferredBranch,
      state: preferredLocation,
      budget: budget ? Number(budget) : undefined,
      results: rawPredictions.slice(0, 10) // save top 10 in history
    });

    // 5. All predictions are completely free and unlocked
    const predictions = rawPredictions.map((pred) => ({
      ...pred,
      isLocked: false
    }));

    return NextResponse.json({
      predictions,
      totalCount: rawPredictions.length,
      isPremium,
      isRelaxed,
      relaxedReason,
      userProfile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        is_premium: isPremium
      }
    });

  } catch (error: any) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
