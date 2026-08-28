"use client"
import { useRef, useEffect, useState } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import { useRouter } from "next/router"
import { ShieldCheckIcon } from "@heroicons/react/24/outline"
import { Award, Wallet } from "lucide-react"
import type { ContentItem } from "@/types"

function Scroll({ content, isPopupOpen }: { content: ContentItem[], isPopupOpen?: boolean }) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Helper function to generate URL-friendly IDs from names
  const generateUrlId = (name: string): string => {
    return encodeURIComponent(
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    );
  };

  // Function to get index from URL hash
  const getIndexFromHash = () => {
    if (typeof window === 'undefined') return 0;
    const hash = window.location.hash.slice(1); // Remove the '#'
    const index = content.findIndex(item => generateUrlId(item.name) === hash);
    return index >= 0 ? index : 0;
  };

  // Initialize currentIndex based on URL hash from the start
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Only run this on client-side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      return getIndexFromHash();
    }
    return 0;
  });

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const isAnimating = useRef(false)
  const scrollAccumulator = useRef(0)
  const scrollThreshold = 100 // Require 100px of scroll to trigger step change

  const length = content.length
  const angle = 360 / length
  const halfHeight = 60 // Represents half the panel height for radius calculation
  const tz = length >= 2 ? Math.round(halfHeight / Math.sin(Math.PI / length)) : 50

  // Initialize rotate with the correct position based on currentIndex
  const rotate = useMotionValue(currentIndex * angle)

  // Function to update URL hash
  const updateUrlHash = (index: number) => {
    if (index === 0) {
      // For the first item, clear the hash to keep URL clean
      router.push('/', undefined, { shallow: true });
    } else {
      const contentItem = content[index];
      if (contentItem) {
        const contentId = generateUrlId(contentItem.name);
        router.push(`#${contentId}`, undefined, { shallow: true });
      }
    }
  };

  // Function to get icon based on item type
  const getTypeIcon = (type: string) => {
    const iconSize = "w-12 h-12 md:w-16 md:h-16";

    switch (type) {
      case 'issuer':
        return <Award className={`${iconSize} text-blue-600`} />;
      case 'holder':
        return <Wallet className={`${iconSize} text-green-600`} />;
      case 'verifier':
        return <ShieldCheckIcon className={`${iconSize} text-purple-600`} />;
      default:
        return null;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animateToIndex = (index: number, updateUrl: boolean = true) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const targetRotation = Math.round(index * angle * 100) / 100; // Round to 2 decimal places
    animate(rotate, targetRotation, {
      type: "spring",
      stiffness: 150,
      damping: 25,
      restDelta: 0.01, // Smaller rest delta for more precise stopping
      onComplete: () => {
        // Force exact alignment to prevent floating point drift
        rotate.set(Math.round(index * angle * 100) / 100);
        isAnimating.current = false;
      }
    });

    if (updateUrl) {
      updateUrlHash(index);
    }
  };

  // Handle hash changes in URL
  useEffect(() => {
    const handleHashChange = () => {
      const newIndex = getIndexFromHash();
      if (newIndex !== currentIndex && !isAnimating.current) {
        setCurrentIndex(newIndex);
        animateToIndex(newIndex, false); // Don't update URL since it's already changed
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentIndex, animateToIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If a popup is open, don't prevent default and don't handle step navigation
      if (isPopupOpen) {
        return;
      }

      e.preventDefault();

      if (isAnimating.current) return;

      // Accumulate scroll delta
      scrollAccumulator.current += e.deltaY;

      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Check if we've crossed the threshold
      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        const newIndex = Math.max(0, Math.min(length - 1, currentIndex + direction));

        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          animateToIndex(newIndex, true); // Update URL when user scrolls
        }

        // Reset accumulator
        scrollAccumulator.current = 0;
      } else {
        // Reset accumulator after a delay if no threshold is reached
        scrollTimeout.current = setTimeout(() => {
          scrollAccumulator.current = 0;
        }, 150);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, length, angle, animateToIndex, isPopupOpen]);

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'issuer':
        return 'bg-blue-50';
      case 'holder':
        return 'bg-green-50';
      case 'verifier':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
  <>
    <div ref={scrollContainerRef} className="bg-white h-screen overflow-hidden">
      <div className="sticky top-0 h-screen w-full" style={{ perspective: "2000px" }}>
        <motion.div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            rotateX: rotate,
            translateZ: `-${tz}vh`,
            willChange: "transform",
          }}
        >
          {content.map((item, i) => {
            return (
              <motion.div
                key={i}
                className={`absolute flex `}
                style={{
                  top: '0',
                  bottom: '0',
                  left: 0,
                  right: 0,
                  transform: `rotateX(${-i * angle}deg) translateZ(${tz}vh)`,
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                }}
              >
                <div className="flex h-full flex-col justify-start overflow-y-auto w-full px-3 md:px-4 lg:px-6 xl:px-8">
                  {
                    i > 0 && <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mt-12 md:mt-16 lg:mt-20 mb-4 md:mb-6 lg:mb-8">
                    {getTypeIcon(item.type)}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">{item.name}</h2>
                  </div>
                  }
                  <div className={`w-full ${i > 0 ? getBackgroundColor(item.type) : ''}`}>{item.content}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
    <div className="fixed bottom-3 right-3 md:bottom-4 md:right-4 lg:bottom-6 lg:right-6 text-black/50 text-xs md:text-sm lg:text-base z-50">
      Step {currentIndex + 1} of {length}
    </div>
  </>
);
}

export default Scroll
