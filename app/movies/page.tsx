"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

import { useState, useEffect, useRef } from "react";

import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";

interface Movie {
  id: number | string;
  title: string;
  poster_path?: string | null;
  // add any other fields from your API response as needed
}

function minutesToHours(minutes: number): number {
  const hours = minutes / 60;
  return Math.round(hours * 10) / 10; // rounds to 1 decimal place
}

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(120);
  const [debouncedValue, setDebouncedValue] = useState<number>(sliderValue);
  const [genre1, setGenre1] = useState<string>("");
  const [releaseYear, setReleaseYear] = useState<string>("");
  const [hourConversion, setHourConversion] = useState<number>(
    minutesToHours(sliderValue)
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the slider value
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(sliderValue);
    }, 500); // Adjust delay as needed

    return () => {
      clearTimeout(timer);
    };
  }, [sliderValue]);

  // Fetch movies when debouncedValue or genre1 changes
  useEffect(() => {
    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `http://127.0.0.1:8000/movies/${debouncedValue}?genres=${encodeURIComponent(
          genre1
        )}&release_year=${encodeURIComponent(releaseYear)}`;

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = (await response.json()) as Movie[];
        setMovies(Array.isArray(data) ? data : []);
      } catch (err: any) {
        // Ignore abort errors
        if (err?.name !== "AbortError") {
          setError(err?.message ?? "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    return () => {
      controller.abort();
      // clear ref if it was this controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [debouncedValue, genre1, releaseYear]);

  // Handlers

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh] w-full">
        <span className="text-lg font-medium animate-pulse">Loading...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[40vh] w-full">
        <span className="text-lg font-medium text-red-600">Error: {error}</span>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-8 bg-white/80 rounded-2xl shadow-lg min-h-[80vh] flex flex-col">
      <div className="w-full flex flex-col items-center gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Movies You Can Finish in
          <span className="ml-2 text-primary font-extrabold text-3xl sm:text-4xl md:text-5xl">
            {sliderValue} min
          </span>
          <span className="ml-2 text-gray-500 text-lg font-medium">
            ({hourConversion} hr)
          </span>
        </h1>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-8">
        <div className="flex-1 flex flex-col gap-2">
          <Label className="text-base font-semibold text-gray-700">
            Max Duration
          </Label>
          <Slider
            className="mt-2"
            value={[sliderValue]}
            onValueChange={(newValue) => {
              setSliderValue(newValue[0]);
              setHourConversion(minutesToHours(newValue[0]));
            }}
            max={240}
            step={1}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Label className="text-base font-semibold text-gray-700">Genre</Label>
          <Select
            onValueChange={(newValue) => setGenre1(newValue)}
            defaultValue={genre1}
          >
            <SelectTrigger className="w-full min-w-[180px]">
              <SelectValue placeholder="Select a genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="27">Horror</SelectItem>
                <SelectItem value="28">Action</SelectItem>
                <SelectItem value="12">Adventure</SelectItem>
                <SelectItem value="16">Animation</SelectItem>
                <SelectItem value="35">Comedy</SelectItem>
                <SelectItem value="80">Crime</SelectItem>
                <SelectItem value="99">Documentary</SelectItem>
                <SelectItem value="18">Drama</SelectItem>
                <SelectItem value="10751">Family</SelectItem>
                <SelectItem value="14">Fantasy</SelectItem>
                <SelectItem value="36">History</SelectItem>
                <SelectItem value="10402">Music</SelectItem>
                <SelectItem value="9648">Mystery</SelectItem>
                <SelectItem value="10749">Romance</SelectItem>
                <SelectItem value="878">Science Fiction</SelectItem>
                <SelectItem value="53">Thriller</SelectItem>
                <SelectItem value="10752">War</SelectItem>
                <SelectItem value="37">Western</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Label className="text-base font-semibold text-gray-700">
            Release Year
          </Label>
          <Select
            onValueChange={(newValue) => setReleaseYear(newValue)}
            defaultValue={releaseYear}
          >
            <SelectTrigger className="w-full min-w-[180px]">
              <SelectValue placeholder="Select Release Year" />
            </SelectTrigger>
            <SelectContent>
              <>
                {Array.from({ length: 2025 - 1950 + 1 }, (_, i) => {
                  const year = 2025 - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
          {movies.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12 text-lg">
              No movies found.
            </div>
          ) : (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white/90 border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-56 object-cover object-top bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    No image
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-center p-2">
                  <div
                    className="text-xs sm:text-sm text-center font-medium text-gray-800 truncate"
                    title={movie.title}
                  >
                    {movie.title}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
