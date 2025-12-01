// src/types/index.ts (FIXED)

export type CinemaStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type HallType = 'STANDARD' | 'PREMIUM' | 'IMAX' | 'FOUR_DX';
export type HallStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type LayoutType = 'STANDARD' | 'DUAL_AISLE' | 'STADIUM';
export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE' | 'PREMIUM' | 'WHEELCHAIR';
export type ShowtimeStatus = 'SELLING' | 'STOPPED' | 'CANCELLED';
export type ShowtimeFormat = 'TWO_D' | 'THREE_D' | 'IMAX' | 'FOUR_DX';
export type DayType = 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY';

// Thay thế `any` bằng kiểu Object cụ thể hơn
type GenericObject = Record<string, unknown>;

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  amenities: string[];
  facilities?: GenericObject;
  images: string[];
  virtualTour360Url?: string;
  rating?: number;
  totalReviews: number;
  operatingHours?: GenericObject;
  socialMedia?: GenericObject;
  status: CinemaStatus;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCinemaRequest {
  name: string;
  address: string;
  city: string;
  district?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  amenities?: string[];
  facilities?: GenericObject;
  images?: string[];
  virtualTour360Url?: string;
  operatingHours?: GenericObject;
  socialMedia?: GenericObject;
  timezone: string;
}

export interface Hall {
  id: string;
  cinemaId: string;
  name: string;
  type: HallType;
  capacity: number;
  rows: number;
  screenType?: string;
  soundSystem?: string;
  features: string[];
  layoutType?: LayoutType;
  status: HallStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHallRequest {
  cinemaId: string;
  name: string;
  type: HallType;
  screenType?: string;
  soundSystem?: string;
  features?: string[];
  layoutType?: LayoutType;
}

export interface UpdateHallRequest {
  name?: string;
  type?: HallType;
  screenType?: string;
  soundSystem?: string;
  features?: string[];
}

// Movie types
export type AgeRating = 'P' | 'K' | 'T13' | 'T16' | 'T18' | 'C';
export type LanguageType = 'ORIGINAL' | 'SUBTITLE' | 'DUBBED';
export type MovieStatus = 'now_showing' | 'upcoming';

export interface Genre {
  id: string;
  name: string;
}

export interface MovieCast {
  name: string;
  profileUrl?: string;
}

export interface MovieSummary {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  runtime: number;
  ageRating: AgeRating;
  productionCountry: string;
  languageType: LanguageType;
}

export interface Movie extends MovieSummary {
  originalTitle?: string;
  overview: string;
  cast: MovieCast[];
  trailerUrl?: string;
  originalLanguage: string;
  spokenLanguages: string[];
  genre: Genre[];
  releaseDate: string;
  director?: string;
  status?: MovieStatus;
}

export interface CreateMovieDto {
  title: string;
  overview: string;
  originalTitle?: string;
  posterUrl: string;
  trailerUrl?: string;
  backdropUrl?: string;
  runtime: number;
  releaseDate: string;
  ageRating: AgeRating;
  originalLanguage: string;
  spokenLanguages: string[];
  languageType: LanguageType;
  productionCountry: string;
  director?: string;
  cast: MovieCast[];
  genreIds: string[];
}

export interface Showtime {
  id: string;
  movieId: string;
  movieReleaseId: string;
  cinemaId: string;
  hallId: string;
  startTime: string;
  endTime: string;
  format: ShowtimeFormat;
  language: string;
  subtitles: string[];
  availableSeats: number;
  totalSeats: number;
  status: ShowtimeStatus;
  dayType: DayType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShowtimeRequest {
  movieId: string;
  movieReleaseId: string;
  cinemaId: string;
  hallId: string;
  startTime: string;
  format: ShowtimeFormat;
  language: string;
  subtitles: string[];
}

export interface UpdateShowtimeRequest {
  movieId?: string;
  movieReleaseId?: string;
  cinemaId?: string;
  hallId?: string;
  startTime?: string;
  format?: ShowtimeFormat;
  language?: string;
  subtitles?: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  hiredAt: string;
  status: string;
  locationId: string;
}