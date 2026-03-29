export const mockRMP = {
  id: '',
  legacyId: '',
  firstName: 'Professor',
  lastName: 'Lastname',
  school: {
    id: '',
    name: '',
  },
  department: '',
  avgRating: 4.5,
  numRatings: 100,
  avgDifficulty: 3.8,
  wouldTakeAgainPercent: 68,
  teacherRatingTags: [],
  ratingsDistribution: {
    r1: 10,
    r2: 30,
    r3: 20,
    r4: 5,
    r5: 5,
    total: 70,
  },
};

export const mockRmpNoRatings = {
  id: '',
  legacyId: '',
  firstName: 'Professor',
  lastName: 'Lastname',
  school: {
    id: '',
    name: '',
  },
  department: '',
  avgRating: 0,
  numRatings: 100,
  avgDifficulty: 3.8,
  wouldTakeAgainPercent: 68,
  teacherRatingTags: [],
  ratingsDistribution: {
    r1: 0,
    r2: 0,
    r3: 0,
    r4: 0,
    r5: 0,
    total: 70,
  },
};
