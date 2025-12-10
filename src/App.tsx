import React, { useState, useMemo, useRef } from "react";
import { Heart, X, RotateCcw, Settings } from "lucide-react";

interface Cat {
  id: number;
  url: string;
  liked: boolean;
  tags?: string[];
}

interface DragPosition {
  x: number;
  y: number;
}

type SwipeDirection = "left" | "right" | null;

const CatSwipeApp: React.FC = () => {
  // Generate cats with various tags
  const catTags = useMemo(
    () => [
      "cute",
      "sleeping",
      "funny",
      "grumpy",
      "kitten",
      "orange",
      "black",
      "white",
      "fluffy",
      "playful",
      "lazy",
      "angry",
      "happy",
      "curious",
      "scared",
    ],
    []
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(catTags);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>(catTags);

  const cats = useMemo<Cat[]>(
    () =>
      selectedTags.flatMap((tag, i) =>
        Array.from({ length: 1 }, (_, j) => ({
          id: i * 10 + j,
          url: `https://cataas.com/cat/${tag}?${i}_${j}`,
          liked: false,
          tags: [tag],
        }))
      ),
    [selectedTags]
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedCats, setLikedCats] = useState<Cat[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<DragPosition>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<DragPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (clientX: number, clientY: number): void => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number): void => {
    if (!isDragging) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });

    if (Math.abs(deltaX) > 20) {
      setSwipeDirection(deltaX > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (): void => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    } else {
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const handleLike = (): void => {
    if (currentIndex >= cats.length) return;

    setLikedCats([...likedCats, cats[currentIndex]]);
    animateSwipe("right");
  };

  const handleDislike = (): void => {
    if (currentIndex >= cats.length) return;
    animateSwipe("left");
  };

  const animateSwipe = (direction: "left" | "right"): void => {
    setSwipeDirection(direction);
    setDragOffset({ x: direction === "right" ? 1000 : -1000, y: 0 });

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= cats.length) {
        setShowResults(true);
      } else {
        setCurrentIndex(nextIndex);
      }
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }, 300);
  };

  const handleReset = (): void => {
    setCurrentIndex(0);
    setLikedCats([]);
    setShowResults(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const handleOpenSettings = (): void => {
    setTempSelectedTags(selectedTags);
    setShowSettings(true);
  };

  const handleCloseSettings = (): void => {
    setShowSettings(false);
  };

  const handleToggleTag = (tag: string): void => {
    setTempSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveSettings = (): void => {
    if (tempSelectedTags.length === 0) {
      alert("Please select at least one tag!");
      return;
    }
    setSelectedTags(tempSelectedTags);
    setCurrentIndex(0);
    setLikedCats([]);
    setShowResults(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    setShowSettings(false);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 200;

  // Settings Modal
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 flex items-center justify-center overflow-x-hidden">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Filter Cat Tags 🏷️
            </h2>
            <button
              onClick={handleCloseSettings}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Select the types of cats you want to see ({tempSelectedTags.length}{" "}
            selected)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-h-96 overflow-y-auto">
            {catTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  tempSelectedTags.includes(tag)
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCloseSettings}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Your Results! 🎉
            </h2>
            <p className="text-xl text-gray-600">
              You liked{" "}
              <span className="font-bold text-pink-500">
                {likedCats.length}
              </span>{" "}
              out of <span className="font-bold">{cats.length}</span> cats
            </p>
          </div>

          {likedCats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {likedCats.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <img
                    src={cat.url}
                    alt="Liked cat"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://cataas.com/cat?${Date.now()}`;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-2">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                  {cat.tags && cat.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      #{cat.tags[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">You didn't like any cats 😿</p>
              <p className="text-sm">Maybe try again?</p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentCat = cats[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">
              Paws & Preferences 🐾
            </h1>
            <button
              onClick={handleOpenSettings}
              className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <p className="text-gray-600">Swipe right to like, left to pass</p>
          <div className="mt-4 text-sm text-gray-500">
            {currentIndex + 1} / {cats.length}
          </div>
        </div>

        {/* Card Stack */}
        <div className="relative h-[500px] mb-8">
          {/* Background cards for depth */}
          {currentIndex + 1 < cats.length && (
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-xl"
              style={{
                transform: "scale(0.95) translateY(10px)",
                zIndex: 1,
                opacity: 0.5,
              }}
            />
          )}
          {currentIndex + 2 < cats.length && (
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-xl"
              style={{
                transform: "scale(0.90) translateY(20px)",
                zIndex: 0,
                opacity: 0.3,
              }}
            />
          )}

          {/* Current card */}
          {currentCat && (
            <div
              ref={cardRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
                opacity: opacity,
                transition: isDragging
                  ? "none"
                  : "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                zIndex: 2,
              }}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) =>
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchMove={(e) =>
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchEnd={handleDragEnd}
            >
              <div className="relative h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <img
                  src={currentCat.url}
                  alt="Cat"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable="false"
                  onError={(e) => {
                    e.currentTarget.src = `https://cataas.com/cat?${Date.now()}`;
                  }}
                />

                {/* Cat tag badge */}
                {currentCat.tags &&
                  currentCat.tags.length > 0 &&
                  !swipeDirection && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium animate-fadeIn">
                      #{currentCat.tags[0]}
                    </div>
                  )}

                {/* Swipe indicators */}
                {swipeDirection === "right" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl rotate-12 animate-pulse">
                      LIKE
                    </div>
                  </div>
                )}
                {swipeDirection === "left" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                    <div className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl -rotate-12 animate-pulse">
                      NOPE
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-6 animate-fadeIn">
          <button
            onClick={handleDislike}
            className="group bg-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            disabled={currentIndex >= cats.length}
          >
            <X className="w-8 h-8 text-red-500 group-hover:text-red-600 transition-colors" />
          </button>

          <button
            onClick={handleLike}
            className="group bg-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            disabled={currentIndex >= cats.length}
          >
            <Heart className="w-8 h-8 text-pink-500 group-hover:text-pink-600 transition-colors" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CatSwipeApp;
