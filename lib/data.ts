export const PROFILE = {
  name: 'Gurpreet',
  height: 173,
  weight: 83,
  goalWeight: 70,
  waist: 1050,
  injuries: ['right shoulder', 'right elbow', 'knees'],
}

export const DIET_TARGETS = {
  cal: 1435,
  protein: 116.5,
  carbs: 102.2,
  fat: 57.9,
}

export const MEAL_PLAN = [
  { id: 'm1', time: '5:45 AM',  name: '1 Medium Apple',              purpose: 'Pre-Gym Fuel',       protein: 0.5,  carbs: 25,   fat: 0.3,  cal: 95 },
  { id: 'm2', time: '7:30 AM',  name: '1 Scoop WPI Shake',           purpose: 'Muscle Repair',       protein: 27,   carbs: 0.1,  fat: 0.2,  cal: 110 },
  { id: 'm3', time: '9:30 AM',  name: '2 Whole Eggs + 1/2 Avocado', purpose: 'Hormones & Skin',     protein: 13,   carbs: 6,    fat: 22,   cal: 270 },
  { id: 'm4', time: '9:35 AM',  name: 'Small Skim Coffee',           purpose: 'Focus',               protein: 3.5,  carbs: 5,    fat: 0.2,  cal: 40 },
  { id: 'm5', time: '12:30 PM', name: '175g Tofu + 350g Potato/Veg', purpose: 'The Fullness Meal',  protein: 25,   carbs: 45,   fat: 8,    cal: 380 },
  { id: 'm6', time: '2:00 PM',  name: 'Electrolytes + 5 Walnuts',   purpose: 'Brain Power',         protein: 2.5,  carbs: 2,    fat: 15,   cal: 160 },
  { id: 'm7', time: '3:30 PM',  name: '1 Scoop WPI Shake',           purpose: 'Hunger Shield',       protein: 27,   carbs: 0.1,  fat: 0.2,  cal: 110 },
  { id: 'm8', time: '6:30 PM',  name: '150g Egg Whites',             purpose: 'Pre-Load Protein',    protein: 16.5, carbs: 1,    fat: 0,    cal: 80 },
  { id: 'm9', time: '7:30 PM',  name: '2 Tbsp Kada Parshad',         purpose: 'Daily Blessing 🙏',   protein: 1.5,  carbs: 18,   fat: 12,   cal: 190 },
]

export const WORKOUT_DAYS = [
  { id: 'push', label: 'Push', day: 'Day 1' },
  { id: 'pull', label: 'Pull', day: 'Day 2' },
  { id: 'legs', label: 'Legs', day: 'Day 3' },
]

export const EXERCISES: Record<string, any[]> = {
  push: [
    { id: 'p0',  name: 'Kettlebell Flat Chest Press',      sets: 4, reps: '10',          note: 'Kettlebell on outside of wrists. If no pair of kettlebells, use fly machine instead.', injury: [], warmup: true },
    { id: 'p00', name: 'Upside Down KB Shoulder Press',    sets: 3, reps: '8 each side', note: 'Hold kettlebell upside down. Press overhead each side.', injury: ['right shoulder'], warmup: true },
    { id: 'p1',  name: 'Incline DB Chest Press',           sets: 3, reps: '8',           note: 'Bench at 45 degrees or lower.', injury: ['right shoulder'], warmup: false },
    { id: 'p2',  name: 'Face Pulls',                       sets: 3, reps: '8',           note: 'Rear delt and rotator cuff. Great for shoulder health.', injury: [], warmup: false },
    { id: 'p3',  name: 'KB Overhead Tricep Extensions',    sets: 3, reps: '10',          note: 'Control the eccentric. Watch right elbow.', injury: ['right elbow'], warmup: false },
    { id: 'p4',  name: 'Rope Tricep Extensions',           sets: 3, reps: '10',          note: 'Use rope attachment. Watch right elbow.', injury: ['right elbow'], warmup: false },
  ],
  pull: [
    { id: 'l0',  name: 'V-Grip Pulldown (to lap)',         sets: 4, reps: '10',          note: 'Pull to lap, not chest. Warmup for lats.', injury: [], warmup: true },
    { id: 'l1',  name: 'Seated Bilateral Row',             sets: 3, reps: '8',           note: 'If one cable, use V-grip as well.', injury: [], warmup: false },
    { id: 'l2',  name: 'Wide Grip Pulldown',               sets: 3, reps: '10',          note: 'Wide grip. Avoid behind-the-neck.', injury: ['right shoulder'], warmup: false },
    { id: 'l3',  name: 'BB Bent Over Row',                 sets: 3, reps: '8',           note: 'Keep back straight and neutral. Hinge at hips.', injury: [], warmup: false },
    { id: 'l4',  name: 'Incline DB Bicep Curls',           sets: 3, reps: '10',          note: 'Bench at 90 degrees, sit forward. Elbow must stay behind your body.', injury: ['right elbow'], warmup: false },
    { id: 'l5',  name: 'Standing BB Curls',                sets: 3, reps: '8',           note: 'Full range of motion. Control the negative.', injury: ['right elbow'], warmup: false },
    { id: 'l6',  name: 'Hammer DB Curls',                  sets: 3, reps: '10',          note: 'Neutral grip — easier on elbow.', injury: ['right elbow'], warmup: false },
  ],
  legs: [
    { id: 'g0',  name: 'Seated Hip Abductions',            sets: 3, reps: '20',          note: 'Loop band below knees. Warmup for hips and knees.', injury: ['knees'], warmup: true },
    { id: 'g1',  name: 'Leg Press',                        sets: 4, reps: '10',          note: 'Feet high on platform. Safer for knees.', injury: ['knees'], warmup: false },
    { id: 'g2',  name: 'Reverse Lunge into High Knee',     sets: 3, reps: '6-8 each side', note: 'Controlled movement. Watch knees on landing.', injury: ['knees'], warmup: false },
    { id: 'g3',  name: 'Seated Leg Curls',                 sets: 3, reps: '15',          note: 'Full range. Controlled eccentric.', injury: [], warmup: false },
    { id: 'g4',  name: 'Seated Leg Extensions',            sets: 3, reps: '15',          note: 'Light to moderate weight. Stop if knee pain.', injury: ['knees'], warmup: false },
    { id: 'g5',  name: 'Standing Calf Raises',             sets: 3, reps: '20',          note: 'Full stretch at bottom.', injury: [], warmup: false },
    { id: 'g6',  name: 'Seated Calf Raises',               sets: 3, reps: '20',          note: 'Different angle to standing. Full range.', injury: [], warmup: false },
  ],
}