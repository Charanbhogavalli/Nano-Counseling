export interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  type: 'Government' | 'Private' | 'Aided' | 'Autonomous';
  rating: number;
  ranking: number;
  fees_median: number; // in INR
  placements_info: {
    median_ctc_lpa: number;
    highest_ctc_lpa: number;
    placement_percentage: number;
  };
  website: string;
  description: string;
  image_url: string;
}

export interface Cutoff {
  id: string;
  college_id: string;
  exam: 'JEE Main' | 'COMEDK' | 'KCET' | 'AP-EAMCET' | 'TS-EAMCET';
  year: number;
  branch: string;
  category: string;
  gender: 'Co-Ed' | 'Female Only' | 'Male Only';
  quota: 'All India' | 'Home State' | 'Management' | 'Counseling';
  round: number;
  opening_rank: number;
  closing_rank: number;
  fees?: number;
  trend_score?: number;
  cutoff_volatility?: number;
  seat_growth_rate?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  is_premium: boolean;
  created_at: string;
}

export const MOCK_COLLEGES: College[] = [
  // JEE Main / NITs / IIITs
  {
    id: 'c1',
    name: 'National Institute of Technology (NIT), Trichy',
    code: 'NITT',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: 'Government',
    rating: 4.8,
    ranking: 9,
    fees_median: 145000,
    placements_info: { median_ctc_lpa: 15.8, highest_ctc_lpa: 52.0, placement_percentage: 97 },
    website: 'https://www.nitt.edu',
    description: 'NIT Trichy is one of India\'s premier engineering institutes, consistently ranked as the top NIT in the country.',
    image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c2',
    name: 'National Institute of Technology (NITK), Surathkal',
    code: 'NITK',
    city: 'Mangaluru',
    state: 'Karnataka',
    type: 'Government',
    rating: 4.7,
    ranking: 12,
    fees_median: 150000,
    placements_info: { median_ctc_lpa: 14.5, highest_ctc_lpa: 54.7, placement_percentage: 95 },
    website: 'https://www.nitk.ac.in',
    description: 'Located right next to the beach, NITK Surathkal offers top-tier education and researcher resources in coastal Karnataka.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c3',
    name: 'International Institute of Information Technology (IIIT), Hyderabad',
    code: 'IIITH',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Private',
    rating: 4.9,
    ranking: 15,
    fees_median: 360000,
    placements_info: { median_ctc_lpa: 30.0, highest_ctc_lpa: 102.0, placement_percentage: 99 },
    website: 'https://www.iiit.ac.in',
    description: 'Renowned globally for its computer science research output, IIIT Hyderabad boasts coding culture at par with top IITs.',
    image_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
  },
  // COMEDK / KCET Colleges
  {
    id: 'c4',
    name: 'RV College of Engineering',
    code: 'RVCE',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Autonomous',
    rating: 4.6,
    ranking: 96,
    fees_median: 240000,
    placements_info: { median_ctc_lpa: 11.2, highest_ctc_lpa: 62.0, placement_percentage: 96 },
    website: 'https://rvce.edu.in',
    description: 'Established in 1963, RVCE is highly sought after through both KCET and COMEDK admissions, located on Mysore Road.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c5',
    name: 'BMS College of Engineering',
    code: 'BMSCE',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Aided',
    rating: 4.5,
    ranking: 101,
    fees_median: 228000,
    placements_info: { median_ctc_lpa: 9.5, highest_ctc_lpa: 48.0, placement_percentage: 92 },
    website: 'https://bmsce.ac.in',
    description: 'One of the first private sector initiatives in engineering education in India, BMSCE boasts a rich heritage and prime location.',
    image_url: 'https://images.unsplash.com/photo-1595514534839-44e27f00bf75?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c6',
    name: 'M. S. Ramaiah Institute of Technology',
    code: 'MSRIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Autonomous',
    rating: 4.4,
    ranking: 78,
    fees_median: 260000,
    placements_info: { median_ctc_lpa: 8.8, highest_ctc_lpa: 46.0, placement_percentage: 91 },
    website: 'https://www.msrit.edu',
    description: 'MSRIT offers excellent infrastructure and is famous for its placement outcomes in core and software branches alike.',
    image_url: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c7',
    name: 'PES University (RR Campus)',
    code: 'PESU',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 4.5,
    ranking: 110,
    fees_median: 450000,
    placements_info: { median_ctc_lpa: 10.5, highest_ctc_lpa: 65.0, placement_percentage: 94 },
    website: 'https://pes.edu',
    description: 'PES University offers rigorous curriculum and excellent industry connects, known for its high-paying placement records.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
  },
  // AP / TS EAMCET Colleges
  {
    id: 'c8',
    name: 'Chaitanya Bharathi Institute of Technology',
    code: 'CBIT',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Autonomous',
    rating: 4.4,
    ranking: 151,
    fees_median: 140000,
    placements_info: { median_ctc_lpa: 7.2, highest_ctc_lpa: 45.6, placement_percentage: 90 },
    website: 'https://www.cbit.ac.in',
    description: 'CBIT is the premier private engineering college in Hyderabad, highly preferred under TS-EAMCET counseling.',
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c9',
    name: 'Vasavi College of Engineering',
    code: 'VCE',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Autonomous',
    rating: 4.3,
    ranking: 165,
    fees_median: 130000,
    placements_info: { median_ctc_lpa: 6.8, highest_ctc_lpa: 36.0, placement_percentage: 88 },
    website: 'https://www.vce.ac.in',
    description: 'Located in Ibrahimbagh, Vasavi is known for its strict discipline and consistent placement track records.',
    image_url: 'https://images.unsplash.com/photo-1498243691581-b148c376de85?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c10',
    name: 'Gayatri Vidya Parishad College of Engineering',
    code: 'GVPE',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'Autonomous',
    rating: 4.2,
    ranking: 188,
    fees_median: 104000,
    placements_info: { median_ctc_lpa: 5.5, highest_ctc_lpa: 31.5, placement_percentage: 85 },
    website: 'https://gvpce.ac.in',
    description: 'One of the best engineering choices under AP-EAMCET, located in the scenic coastal city of Vizag.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c11',
    name: 'Velagapudi Ramakrishna Siddhartha Engineering College',
    code: 'VRSEC',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    type: 'Autonomous',
    rating: 4.1,
    ranking: 172,
    fees_median: 95000,
    placements_info: { median_ctc_lpa: 5.0, highest_ctc_lpa: 28.0, placement_percentage: 84 },
    website: 'https://www.vrsiddhartha.ac.in',
    description: 'The first private engineering college in unified Andhra Pradesh, carrying a long-standing legacy of engineering excellence.',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
  },
  // COMEDK / KCET Tier-2 & Tier-3
  {
    id: 'c12',
    name: 'Dayananda Sagar College of Engineering',
    code: 'DSCE',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Autonomous',
    rating: 4.3,
    ranking: 120,
    fees_median: 235000,
    placements_info: { median_ctc_lpa: 7.5, highest_ctc_lpa: 36.0, placement_percentage: 89 },
    website: 'https://dayanandasagar.edu',
    description: 'DSCE is a massive campus in Kumarswamy Layout, popular for strong placements and a huge student community.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c13',
    name: 'Bangalore Institute of Technology',
    code: 'BIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Aided',
    rating: 4.2,
    ranking: 135,
    fees_median: 220000,
    placements_info: { median_ctc_lpa: 7.0, highest_ctc_lpa: 32.0, placement_percentage: 87 },
    website: 'https://bit-bangalore.edu.in',
    description: 'Located in the heart of Bangalore at VV Puram, BIT is famous for its placement records and close proximity to corporate hubs.',
    image_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c14',
    name: 'Sir M. Visvesvaraya Institute of Technology',
    code: 'SIRMVIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 4.0,
    ranking: 155,
    fees_median: 200000,
    placements_info: { median_ctc_lpa: 6.2, highest_ctc_lpa: 28.0, placement_percentage: 82 },
    website: 'https://www.sirmvit.edu',
    description: 'Situated on a scenic campus near Bangalore International Airport, offering solid education and placement track records.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c15',
    name: 'Nitte Meenakshi Institute of Technology',
    code: 'NMIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Autonomous',
    rating: 4.1,
    ranking: 142,
    fees_median: 225000,
    placements_info: { median_ctc_lpa: 6.5, highest_ctc_lpa: 30.0, placement_percentage: 85 },
    website: 'https://nmit.ac.in',
    description: 'An autonomous engineering college in Yelahanka, Bangalore, known for multidisciplinary engineering research.',
    image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c16',
    name: 'RNS Institute of Technology',
    code: 'RNSIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 4.0,
    ranking: 168,
    fees_median: 190000,
    placements_info: { median_ctc_lpa: 5.8, highest_ctc_lpa: 25.0, placement_percentage: 81 },
    website: 'https://www.rnsit.ac.in',
    description: 'Located in Channasandra, RNSIT offers a peaceful green campus and high quality coding training modules.',
    image_url: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c17',
    name: 'REVA University',
    code: 'REVA',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 4.1,
    ranking: 180,
    fees_median: 250000,
    placements_info: { median_ctc_lpa: 5.5, highest_ctc_lpa: 24.0, placement_percentage: 80 },
    website: 'https://reva.edu.in',
    description: 'A modern private university featuring stellar state-of-the-art infrastructure and placement modules in Bangalore.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c18',
    name: 'CMR Institute of Technology',
    code: 'CMRIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 3.9,
    ranking: 195,
    fees_median: 185000,
    placements_info: { median_ctc_lpa: 5.2, highest_ctc_lpa: 22.0, placement_percentage: 78 },
    website: 'https://www.cmrit.ac.in',
    description: 'Located near the Whitefield IT corridor, CMRIT is ideal for students seeking internships and jobs in software companies.',
    image_url: 'https://images.unsplash.com/photo-1595514534839-44e27f00bf75?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c19',
    name: 'Don Bosco Institute of Technology',
    code: 'DBIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 3.8,
    ranking: 220,
    fees_median: 160000,
    placements_info: { median_ctc_lpa: 4.8, highest_ctc_lpa: 18.0, placement_percentage: 74 },
    website: 'https://dbit.co.in',
    description: 'A spacious campus on Mysore Road providing focused engineering training and supportive placements.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c20',
    name: 'Alliance College of Engineering',
    code: 'ACET',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 3.9,
    ranking: 210,
    fees_median: 275000,
    placements_info: { median_ctc_lpa: 5.0, highest_ctc_lpa: 20.0, placement_percentage: 76 },
    website: 'https://alliance.edu.in',
    description: 'Part of Alliance University, offering global course layouts and industry-integrated labs in South Bangalore.',
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800'
  },
  // TS-EAMCET Tier-2
  {
    id: 'c21',
    name: 'MVSR Engineering College',
    code: 'MVSREC',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Private',
    rating: 4.0,
    ranking: 185,
    fees_median: 125000,
    placements_info: { median_ctc_lpa: 5.5, highest_ctc_lpa: 24.0, placement_percentage: 82 },
    website: 'https://mvsrec.edu.in',
    description: 'A respected institution in Nadergul offering solid engineering foundation classes and active placement drives.',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c22',
    name: 'Gokaraju Rangaraju Institute of Engineering & Technology',
    code: 'GRIET',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Autonomous',
    rating: 4.2,
    ranking: 148,
    fees_median: 135000,
    placements_info: { median_ctc_lpa: 6.5, highest_ctc_lpa: 32.5, placement_percentage: 86 },
    website: 'https://griet.ac.in',
    description: 'An autonomous college renowned for its engineering labs and active student placement counts in Kukatpally.',
    image_url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c23',
    name: 'Vardhaman College of Engineering',
    code: 'VCEH',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Autonomous',
    rating: 4.1,
    ranking: 153,
    fees_median: 125000,
    placements_info: { median_ctc_lpa: 6.0, highest_ctc_lpa: 28.0, placement_percentage: 84 },
    website: 'https://vardhaman.org',
    description: 'Vardhaman offers quality technical courses on a state-of-the-art campus in Shamshabad.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c24',
    name: 'VNR Vignana Jyothi Institute of Engineering & Technology',
    code: 'VNRVJIET',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Autonomous',
    rating: 4.3,
    ranking: 113,
    fees_median: 145000,
    placements_info: { median_ctc_lpa: 7.2, highest_ctc_lpa: 38.0, placement_percentage: 90 },
    website: 'https://vnrvjiet.ac.in',
    description: 'Highly ranked engineering institute in Bachupally, Hyderabad, known for outstanding placement records and student projects.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'
  },
  // AP-EAMCET Tier-2
  {
    id: 'c25',
    name: 'Prasad V. Potluri Siddhartha Institute of Technology',
    code: 'PVPSIT',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    type: 'Autonomous',
    rating: 4.0,
    ranking: 190,
    fees_median: 90000,
    placements_info: { median_ctc_lpa: 4.8, highest_ctc_lpa: 22.0, placement_percentage: 80 },
    website: 'https://pvpsiddhartha.ac.in',
    description: 'An autonomous engineering college in Vijayawada offering dynamic curricula and consistent placements.',
    image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c26',
    name: 'Sree Vidyanikethan Engineering College',
    code: 'SVEC',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    type: 'Autonomous',
    rating: 4.1,
    ranking: 160,
    fees_median: 98000,
    placements_info: { median_ctc_lpa: 5.2, highest_ctc_lpa: 25.0, placement_percentage: 83 },
    website: 'https://svec.education',
    description: 'Located in Tirupati, SVEC provides rigorous educational standards and excellent campus placement opportunities.',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c27',
    name: 'Madanapalle Institute of Technology & Science',
    code: 'MITS',
    city: 'Madanapalle',
    state: 'Andhra Pradesh',
    type: 'Autonomous',
    rating: 4.0,
    ranking: 182,
    fees_median: 88000,
    placements_info: { median_ctc_lpa: 4.5, highest_ctc_lpa: 20.0, placement_percentage: 79 },
    website: 'https://mits.ac.in',
    description: 'Situated in Chittoor district, MITS is famous for its massive placements in multinational IT organizations.',
    image_url: 'https://images.unsplash.com/photo-1595514534839-44e27f00bf75?auto=format&fit=crop&q=80&w=800'
  },
  // JEE Main Tier-2
  {
    id: 'c28',
    name: 'National Institute of Technology (NIT), Silchar',
    code: 'NITS',
    city: 'Silchar',
    state: 'Assam',
    type: 'Government',
    rating: 4.4,
    ranking: 40,
    fees_median: 135000,
    placements_info: { median_ctc_lpa: 10.8, highest_ctc_lpa: 44.0, placement_percentage: 89 },
    website: 'https://nits.ac.in',
    description: 'One of the top-performing NITs in Northeast India, featuring excellent coding culture and core engineering research.',
    image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c29',
    name: 'National Institute of Technology (NIT), Agartala',
    code: 'NITA',
    city: 'Agartala',
    state: 'Tripura',
    type: 'Government',
    rating: 4.2,
    ranking: 80,
    fees_median: 130000,
    placements_info: { median_ctc_lpa: 9.5, highest_ctc_lpa: 40.0, placement_percentage: 84 },
    website: 'https://nita.ac.in',
    description: 'A premier national institute with a massive campus and fully updated laboratory research facilities.',
    image_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'c30',
    name: 'National Institute of Technology (NIT), Srinagar',
    code: 'NITSRI',
    city: 'Srinagar',
    state: 'Jammu and Kashmir',
    type: 'Government',
    rating: 4.0,
    ranking: 102,
    fees_median: 140000,
    placements_info: { median_ctc_lpa: 8.5, highest_ctc_lpa: 36.0, placement_percentage: 81 },
    website: 'https://nitsri.ac.in',
    description: 'Established in 1960, NIT Srinagar offers robust technical curricula in a scenic Himalayan campus setting.',
    image_url: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_BRANCHES = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'ISE', name: 'Information Science & Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning' }
];

export const generateMockCutoffs = (): Cutoff[] => {
  const cutoffs: Cutoff[] = [];
  const years = [2025, 2024, 2023];
  const rounds = [1, 2, 3];
  
  let idCounter = 1;

  // Let's create reproducible cutoffs for mock colleges
  MOCK_COLLEGES.forEach((col) => {
    years.forEach((yr) => {
      rounds.forEach((rd) => {
        // Different exams depending on college
        let collegeExams: ('JEE Main' | 'COMEDK' | 'KCET' | 'AP-EAMCET' | 'TS-EAMCET')[] = [];
        
        const idNum = Number(col.id.replace('c', ''));
        if ((idNum >= 1 && idNum <= 3) || (idNum >= 28 && idNum <= 30) || (idNum >= 46 && idNum <= 60)) {
          collegeExams = ['JEE Main'];
        } else if ((idNum >= 4 && idNum <= 7) || (idNum >= 12 && idNum <= 20) || (idNum >= 31 && idNum <= 45)) {
          collegeExams = ['KCET', 'COMEDK'];
        } else if ((idNum >= 8 && idNum <= 9) || (idNum >= 21 && idNum <= 24) || (idNum >= 61 && idNum <= 70)) {
          collegeExams = ['TS-EAMCET'];
        } else if ((idNum >= 10 && idNum <= 11) || (idNum >= 25 && idNum <= 27) || (idNum >= 71 && idNum <= 80)) {
          collegeExams = ['AP-EAMCET'];
        }

        collegeExams.forEach((ex) => {
          // Add cutoff details for each branch
          MOCK_BRANCHES.forEach((br) => {
            // Determine base ranks based on college tier and branch
            let baseClosingRank = 5000;
            
            // Branch multiplier (CSE is lowest rank, Civil is highest)
            const branchMult = {
              'CSE': 0.15,
              'AIML': 0.28,
              'ISE': 0.40,
              'ECE': 0.65,
              'ME': 1.8,
              'CE': 2.8
            }[br.code] || 1.0;

            // Base rank calculated using a combination of NIRF and rating, weighted appropriately
            const tierScore = col.rating > 4.5 ? 1 : col.rating > 4.2 ? 2 : col.rating > 3.9 ? 3 : 4;
            let collegeBase = 10000;
            if (ex === 'JEE Main') {
              collegeBase = tierScore === 1 ? 6000 : tierScore === 2 ? 15000 : tierScore === 3 ? 35000 : 60000;
            } else if (ex === 'COMEDK') {
              collegeBase = tierScore === 1 ? 3500 : tierScore === 2 ? 12000 : tierScore === 3 ? 25000 : 55000;
            } else if (ex === 'KCET') {
              collegeBase = tierScore === 1 ? 2500 : tierScore === 2 ? 8000 : tierScore === 3 ? 18000 : 40000;
            } else if (ex === 'TS-EAMCET') {
              collegeBase = tierScore === 1 ? 8000 : tierScore === 2 ? 18000 : tierScore === 3 ? 35000 : 65000;
            } else if (ex === 'AP-EAMCET') {
              collegeBase = tierScore === 1 ? 12000 : tierScore === 2 ? 28000 : tierScore === 3 ? 55000 : 95000;
            }

            baseClosingRank = collegeBase * branchMult;

            // Categories
            const categories = ex === 'JEE Main' 
              ? ['General', 'OBC-NCL', 'SC', 'ST'] 
              : ex === 'KCET' 
                ? ['GM', '2A', '3A', 'SC', 'ST']
                : ['General', 'OBC', 'SC', 'ST']; // COMEDK / EAMCET

            categories.forEach((cat) => {
              // Category multiplier (General closes lower, ST closes higher)
              const catMult = {
                'General': 1.0,
                'GM': 1.0,
                'OBC': 1.5,
                'OBC-NCL': 1.6,
                '2A': 1.8,
                '3A': 1.4,
                'SC': 4.0,
                'ST': 6.0
              }[cat] || 1.5;

              // Round factor: later rounds close at higher ranks
              const roundFactor = 1.0 + (rd - 1) * 0.18;
              
              // Year drift: cutoffs fluctuate slightly year-by-year
              const yearDrift = 1.0 + (2025 - yr) * 0.08;

              // Random-ish but deterministic factor to make ranks look realistic
              const detFactor = 0.95 + (Number(col.id.replace('c', '')) * 3 + yr % 5 + rd % 3) * 0.01;

              const closing = Math.round(baseClosingRank * catMult * roundFactor * yearDrift * detFactor);
              const opening = Math.round(closing * 0.75);

              // Fees can fluctuate based on category and exam
              let computedFees = col.fees_median;
              if (cat === 'SC' || cat === 'ST') {
                computedFees = Math.round(col.fees_median * 0.15); // fee concession
              } else if (ex === 'KCET') {
                computedFees = 96000; // standard Govt-regulated KCET fee
              }

              // Trend score between -5.00 and +5.00
              const trendScore = parseFloat((Math.sin(idCounter) * 4.5).toFixed(2));
              // Volatility between 0.02 and 0.22
              const cutoffVolatility = parseFloat((0.02 + Math.abs(Math.cos(idCounter) * 0.20)).toFixed(3));
              // Seat growth rate between -0.05 and +0.15
              const seatGrowthRate = parseFloat((-0.05 + Math.abs(Math.sin(idCounter * 2) * 0.20)).toFixed(3));

              cutoffs.push({
                id: `cutoff-${idCounter++}`,
                college_id: col.id,
                exam: ex,
                year: yr,
                branch: br.code,
                category: cat,
                gender: 'Co-Ed',
                quota: ex === 'JEE Main' ? 'All India' : 'Counseling',
                round: rd,
                opening_rank: opening,
                closing_rank: closing,
                fees: computedFees,
                trend_score: trendScore,
                cutoff_volatility: cutoffVolatility,
                seat_growth_rate: seatGrowthRate
              });
            });
          });
        });
      });
    });
  });

  return cutoffs;
};

// Global loaded cutoffs
export const MOCK_CUTOFFS = generateMockCutoffs();

// LocalStorage helpers to simulate dynamic database edits
export const getStoredData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    const parsed = JSON.parse(stored);
    // If defaultValue is an array and has more elements, overwrite stale localStorage cache
    if (Array.isArray(defaultValue) && Array.isArray(parsed) && defaultValue.length > parsed.length) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    return defaultValue;
  }
};

export const setStoredData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};
