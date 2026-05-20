import { College, Cutoff } from './mockDb';

export interface PredictorInputs {
  exam: 'JEE Main' | 'COMEDK' | 'KCET' | 'AP-EAMCET' | 'TS-EAMCET';
  rank: number;
  category: string;
  gender: string;
  preferredBranch?: string; // Code e.g. CSE, ECE
  preferredLocation?: string; // State or City
  budget?: number; // Maximum annual fee
  collegeType?: 'All' | 'Government' | 'Private' | 'Autonomous';
}

export interface PredictionResult {
  cutoffId: string;
  college: College;
  branch: string;
  year: number;
  round: number;
  closingRank: number;
  openingRank: number;
  fees: number;
  probability: number; // 0 to 100
  status: 'Safe' | 'Moderate' | 'Dream';
  score: number; // Best choice engine score (0-100)
  recommendationReason: string;
  branchStrength: number;
  feeStructure: {
    tuitionFees: number;
    developmentFees: number;
    totalAnnualFees: number;
  };
  historicalTrend: {
    year: number;
    round: number;
    closingRank: number;
  }[];
  isLocked?: boolean;
  trendScore: number;
  cutoffVolatility: number;
  seatGrowthRate: number;
  expectedClosingRank: number;
  trendIndicator: 'Improving' | 'Stable' | 'Declining';
}

export interface PredictionEngineOutput {
  predictions: PredictionResult[];
  isRelaxed: boolean;
  relaxedReason?: string;
}

// Branch similarity chains for recommendation engine
const BRANCH_SIMILARITY: Record<string, string[]> = {
  'CSE': ['CSE', 'ISE', 'AIML', 'DS', 'IT'],
  'AIML': ['AIML', 'CSE', 'ISE', 'DS', 'IT'],
  'ISE': ['ISE', 'CSE', 'AIML', 'DS', 'IT'],
  'ECE': ['ECE', 'EEE', 'ETE'],
  'ME': ['ME', 'AUTO', 'IND']
};

const runPredictionQuery = (
  inputs: PredictorInputs,
  cutoffs: Cutoff[],
  colleges: College[],
  rankMultiplier: number, // minimum ratio (e.g. 0.80 for normal, 0.50 for relaxed)
  overrideBranch?: string[],
  overrideLocation?: boolean,
  overrideBudgetMultiplier = 1.0
): PredictionResult[] => {
  const {
    exam,
    rank,
    category,
    gender,
    preferredBranch,
    preferredLocation,
    budget,
    collegeType
  } = inputs;

  const activeBranches = overrideBranch 
    ? overrideBranch 
    : (preferredBranch && preferredBranch !== 'All' ? [preferredBranch] : null);

  const activeLocation = overrideLocation ? 'All' : preferredLocation;
  const activeBudget = budget ? budget * overrideBudgetMultiplier : undefined;

  // Filter cutoffs by exam, category and gender constraints
  let eligibleCutoffs = cutoffs.filter(
    (c) =>
      c.exam === exam &&
      c.category.toLowerCase() === category.toLowerCase() &&
      (c.gender === 'Co-Ed' || c.gender === gender)
  );

  // Filter by branch
  if (activeBranches && activeBranches.length > 0) {
    eligibleCutoffs = eligibleCutoffs.filter((c) => activeBranches.includes(c.branch));
  }

  const results: PredictionResult[] = [];

  eligibleCutoffs.forEach((cut) => {
    const college = colleges.find((col) => col.id === cut.college_id);
    if (!college) return;

    // Filter by college type
    if (collegeType && collegeType !== 'All') {
      if (collegeType === 'Government' && college.type !== 'Government') return;
      if (collegeType === 'Private' && college.type !== 'Private') return;
      if (collegeType === 'Autonomous' && college.type !== 'Autonomous') return;
    }

    // Filter by budget
    const cutoffFees = cut.fees ?? college.fees_median;
    if (activeBudget && cutoffFees > activeBudget) return;

    // Filter by location
    if (activeLocation && activeLocation !== 'All') {
      const locMatch =
        college.city.toLowerCase().includes(activeLocation.toLowerCase()) ||
        college.state.toLowerCase().includes(activeLocation.toLowerCase());
      if (!locMatch) return;
    }

    // 1. Prediction ranges check:
    // Exclude if cutoff closing rank is below the dream range multiplier
    if (cut.closing_rank < rank * rankMultiplier) {
      return;
    }

    // 2. Confidence Engine Formula:
    // confidence = 1 - abs(user_rank - closing_rank) / closing_rank
    let confidence = 1 - Math.abs(rank - cut.closing_rank) / cut.closing_rank;
    if (rank <= cut.closing_rank) {
      // Guaranteed admission yields Safe status (clipped to high confidence)
      confidence = 1.0;
    }
    confidence = Math.max(0.05, Math.min(0.99, confidence));

    let status: 'Safe' | 'Moderate' | 'Dream';
    if (confidence > 0.85) {
      status = 'Safe';
    } else if (confidence >= 0.65) {
      status = 'Moderate';
    } else {
      status = 'Dream';
    }

    const probability = Math.round(confidence * 100);

    // Weighted Score engine scoring indices:
    // 1. Rank Probability (45% weight)
    const probScore = probability;

    // 2. Branch Match (20% weight)
    let branchScore = 100;
    if (preferredBranch && preferredBranch !== 'All') {
      if (cut.branch === preferredBranch) {
        branchScore = 100;
      } else if (BRANCH_SIMILARITY[preferredBranch]?.includes(cut.branch)) {
        branchScore = 70; // similar
      } else {
        branchScore = 30; // unrelated
      }
    }

    // 3. Location Match (10% weight)
    let locationScore = 100;
    if (preferredLocation && preferredLocation !== 'All') {
      const locMatch =
        college.city.toLowerCase().includes(preferredLocation.toLowerCase()) ||
        college.state.toLowerCase().includes(preferredLocation.toLowerCase());
      locationScore = locMatch ? 100 : 30;
    }

    // 4. Fee Affordability (15% weight)
    let feeScore = 100;
    if (budget) {
      feeScore = cutoffFees <= budget ? 100 : Math.max(0, Math.round(100 - ((cutoffFees - budget) / budget) * 100));
    } else {
      feeScore = Math.max(0, Math.round(100 - (cutoffFees / 350000) * 100));
    }

    // 5. College Rating/Reputation (10% weight)
    const ratingScore = Math.round((college.rating / 5) * 100);

    const score = Math.round(
      probScore * 0.45 +
      branchScore * 0.20 +
      locationScore * 0.10 +
      feeScore * 0.15 +
      ratingScore * 0.10
    );

    // Compute fee details
    const tuitionFees = cutoffFees;
    const developmentFees = Math.round(tuitionFees * 0.08);
    const totalAnnualFees = tuitionFees + developmentFees;

    // Recommendation message generator
    let recommendationReason = '';
    if (status === 'Safe') {
      recommendationReason = `Excellent match. Your rank is well within the safe zone, out-matching last year's closing rank of ${cut.closing_rank} by a comfortable margin.`;
    } else if (status === 'Moderate') {
      recommendationReason = `Highly competitive option. Your rank is close to the cutoff of ${cut.closing_rank}, indicating a very strong matching chance.`;
    } else {
      recommendationReason = `Dream selection. Historically closes at ${cut.closing_rank}, but represents a premium placement upgrade worth listing at the top of your sequence.`;
    }

    // Branch strength index
    const isTech = ['CSE', 'AIML', 'ISE'].includes(cut.branch);
    const branchStrength = Math.min(100, Math.round(
      (isTech ? 90 : 75) * (college.rating / 5) + 
      (college.placements_info.placement_percentage / 100) * 10
    ));

    // Trend & recommendation system parameters
    const trendScore = cut.trend_score ?? 0;
    const cutoffVolatility = cut.cutoff_volatility ?? 0.05;
    const seatGrowthRate = cut.seat_growth_rate ?? 0;
    
    // expectedClosingRank = closingRank * (1 - trendScore * 0.015)
    const expectedClosingRank = Math.round(cut.closing_rank * (1 - trendScore * 0.015));

    let trendIndicator: 'Improving' | 'Stable' | 'Declining' = 'Stable';
    if (trendScore > 1.0) {
      trendIndicator = 'Improving';
    } else if (trendScore < -1.0) {
      trendIndicator = 'Declining';
    }

    // Historical trends array
    const historicalTrend = cutoffs
      .filter(
        (c) =>
          c.college_id === cut.college_id &&
          c.branch === cut.branch &&
          c.category.toLowerCase() === cut.category.toLowerCase() &&
          c.gender === cut.gender &&
          c.exam === cut.exam
      )
      .map((c) => ({
        year: c.year,
        round: c.round,
        closingRank: c.closing_rank
      }))
      .sort((a, b) => b.year - a.year || a.round - b.round);

    results.push({
      cutoffId: cut.id,
      college,
      branch: cut.branch,
      year: cut.year,
      round: cut.round,
      closingRank: cut.closing_rank,
      openingRank: cut.opening_rank,
      fees: cutoffFees,
      probability,
      status,
      score,
      recommendationReason,
      branchStrength,
      feeStructure: {
        tuitionFees,
        developmentFees,
        totalAnnualFees
      },
      historicalTrend,
      trendScore,
      cutoffVolatility,
      seatGrowthRate,
      expectedClosingRank,
      trendIndicator
    });
  });

  return results.sort((a, b) => b.score - a.score);
};

export const predictColleges = (
  inputs: PredictorInputs,
  cutoffs: Cutoff[],
  colleges: College[]
): PredictionEngineOutput => {
  // Step 1: Query exact inputs
  let predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.80);
  if (predictions.length > 0) {
    return { predictions, isRelaxed: false };
  }

  // Step 2: Relax branch filters using similarity clusters
  if (inputs.preferredBranch && inputs.preferredBranch !== 'All') {
    const similar = BRANCH_SIMILARITY[inputs.preferredBranch] || [];
    if (similar.length > 0) {
      predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.80, similar);
      if (predictions.length > 0) {
        return {
          predictions,
          isRelaxed: true,
          relaxedReason: 'Showing closest historical matches based on prediction intelligence. Expanded search to related adjacent branches (CSE/AIML/ISE).'
        };
      }
    }
  }

  // Step 3: Relax location limits
  if (inputs.preferredLocation && inputs.preferredLocation !== 'All') {
    const similar = inputs.preferredBranch && inputs.preferredBranch !== 'All' 
      ? BRANCH_SIMILARITY[inputs.preferredBranch] 
      : undefined;
    
    predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.80, similar, true);
    if (predictions.length > 0) {
      return {
        predictions,
        isRelaxed: true,
        relaxedReason: 'Showing closest historical matches based on prediction intelligence. Relaxed location constraints to search all cities/states.'
      };
    }
  }

  // Step 4: Relax budget constraints
  if (inputs.budget) {
    const similar = inputs.preferredBranch && inputs.preferredBranch !== 'All' 
      ? BRANCH_SIMILARITY[inputs.preferredBranch] 
      : undefined;

    predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.80, similar, true, 1.35);
    if (predictions.length > 0) {
      return {
        predictions,
        isRelaxed: true,
        relaxedReason: 'Showing closest historical matches based on prediction intelligence. Expanded budget thresholds to display slightly higher fee options.'
      };
    }
  }

  // Step 5: Expand acceptable closing rank multiplier (up to 0.50x of user rank)
  predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.50, undefined, true, 2.0);
  if (predictions.length > 0) {
    return {
      predictions,
      isRelaxed: true,
      relaxedReason: 'Showing closest historical matches based on prediction intelligence. Expanded rank boundaries to display dream stretch colleges.'
    };
  }

  // Step 6: Full fallback, show nearest choices
  predictions = runPredictionQuery(inputs, cutoffs, colleges, 0.25, undefined, true, 5.0);
  return {
    predictions,
    isRelaxed: true,
    relaxedReason: 'Showing closest historical matches based on prediction intelligence.'
  };
};

export const generateCounselingOrder = (predictions: PredictionResult[]): PredictionResult[] => {
  return [...predictions].sort((a, b) => {
    const getClgRepScore = (res: PredictionResult) => {
      const nirf = res.college.ranking || 250;
      const ctc = res.college.placements_info.median_ctc_lpa;
      return ctc * 10 + (250 - nirf) * 0.5;
    };

    const repA = getClgRepScore(a);
    const repB = getClgRepScore(b);

    if (Math.abs(repA - repB) > 10) {
      return repB - repA;
    }
    return b.probability - a.probability;
  });
};
