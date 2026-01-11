import { Document, Types } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  GYM_OWNER = 'GYM_OWNER',
  ADMIN = 'ADMIN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum GymStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  TECHNIQUE = 'technique'
}

export enum ExerciseStatus {
  OFFICIAL = 'official',
  CUSTOM = 'custom'
}

export enum Visibility {
  PUBLIC = 'public',
  GYM_ONLY = 'gym_only',
  PRIVATE = 'private'
}

export enum CreatorType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum MetricType {
  WEIGHT = 'weight',
  REPS = 'reps',
  TIME = 'time',
  DISTANCE = 'distance',
  DURATION = 'duration'
}

export enum EquipmentType {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  BODYWEIGHT = 'bodyweight',
  CABLE = 'cable',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  OTHER = 'other'
}

export enum StepType {
  EXERCISE = 'exercise',
  REST = 'rest',
  SUPERSET = 'superset',
  CIRCUIT = 'circuit',
  WARMUP = 'warmup',
  COOLDOWN = 'cooldown'
}

export enum Intensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  MAX = 'max'
}

export enum RestType {
  ACTIVE = 'active',
  PASSIVE = 'passive'
}

export enum SessionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum PerformanceDifficulty {
  TOO_EASY = 'too_easy',
  GOOD = 'good',
  CHALLENGING = 'challenging',
  TOO_HARD = 'too_hard'
}

export enum RankingType {
  FASTEST_TIME = 'fastest_time',
  HEAVIEST_WEIGHT = 'heaviest_weight',
  MOST_REPS = 'most_reps',
  TOTAL_VOLUME = 'total_volume'
}

export enum BadgeCategory {
  ACHIEVEMENT = 'achievement',
  STREAK = 'streak',
  COMPETITION = 'competition',
  MILESTONE = 'milestone'
}

export enum BadgeRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum CriteriaType {
  WORKOUT_COUNT = 'workout_count',
  STREAK_DAYS = 'streak_days',
  CHALLENGE_WINS = 'challenge_wins',
  TOTAL_CALORIES = 'total_calories'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  points: number;
  level: number;
  badges: Types.ObjectId[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGym extends Document {
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  photos: string[];
  capacity?: number;
  status: GymStatus;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExerciseCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
}

export interface IEquipment extends Document {
  gymId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  type: string;
  description?: string;
  muscleGroups: string[];
  quantity: number;
  isAvailable: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExercise extends Document {
  creatorId: Types.ObjectId;
  creatorType: CreatorType;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  instructions?: string;
  exerciseType: ExerciseType;
  difficulty: Difficulty;
  equipmentType: EquipmentType;
  muscleGroups: string[];
  metrics: {
    type: MetricType;
    unit: string;
    isRequired: boolean;
  }[];
  videoUrl?: string;
  thumbnailUrl?: string;
  status: ExerciseStatus;
  visibility: Visibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkout extends Document {
  creatorId: Types.ObjectId;
  creatorType: CreatorType;
  gymId?: Types.ObjectId;
  categoryId: Types.ObjectId;
  title: string;
  description?: string;
  difficulty: Difficulty;
  estimatedDuration: number;
  coverImage?: string;
  visibility: Visibility;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkoutStep extends Document {
  workoutId: Types.ObjectId;
  order: number;
  stepType: StepType;
  exerciseId?: Types.ObjectId;
  equipmentId?: Types.ObjectId;
  parameters: {
    sets?: number;
    reps?: number;
    weight?: number;
    distance?: number;
    duration?: number;
    intensity?: Intensity;
    tempo?: string;
    notes?: string;
  };
  restAfter?: {
    duration: number;
    type: RestType;
  };
  supersetExercises?: {
    exerciseId: Types.ObjectId;
    equipmentId?: Types.ObjectId;
    parameters: {
      sets?: number;
      reps?: number;
      weight?: number;
      distance?: number;
      duration?: number;
      intensity?: Intensity;
      tempo?: string;
      notes?: string;
    };
  }[];
  circuitRounds?: number;
  createdAt: Date;
}

export interface IWorkoutSession extends Document {
  userId: Types.ObjectId;
  workoutId: Types.ObjectId;
  gymId?: Types.ObjectId;
  sessionDate: Date;
  status: SessionStatus;
  startedAt?: Date;
  completedAt?: Date;
  actualDuration?: number;
  stepPerformances: {
    stepId: Types.ObjectId;
    completed: boolean;
    actualPerformance?: {
      setsCompleted?: number;
      repsCompleted?: number[];
      weightUsed?: number;
      distanceCompleted?: number;
      timeCompleted?: number;
      avgHeartRate?: number;
      difficulty?: PerformanceDifficulty;
      notes?: string;
    };
    startTime?: Date;
    endTime?: Date;
  }[];
  overallFeeling?: {
    energy: number;
    difficulty: number;
    satisfaction: number;
    notes?: string;
  };
  caloriesBurned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallenge extends Document {
  workoutId: Types.ObjectId;
  creatorId: Types.ObjectId;
  gymId?: Types.ObjectId;
  title: string;
  description?: string;
  rankingType: RankingType;
  startDate: Date;
  endDate: Date;
  pointsReward: {
    first: number;
    second: number;
    third: number;
    participation: number;
  };
  visibility: Visibility;
  isActive: boolean;
  createdAt: Date;
}

export interface IChallengeParticipation extends Document {
  challengeId: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  score: number;
  rank?: number;
  pointsEarned: number;
  completedAt: Date;
  createdAt: Date;
}

export interface IBadge extends Document {
  name: string;
  description?: string;
  icon?: string;
  category: BadgeCategory;
  criteria: {
    type: CriteriaType;
    threshold: number;
  };
  points: number;
  rarity: BadgeRarity;
  createdAt: Date;
}
