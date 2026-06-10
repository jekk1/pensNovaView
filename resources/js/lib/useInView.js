import { useEffect, useRef, useState } from 'react';

// Hook Intersection Observer untuk deteksi elemen masuk viewport
export function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || inView) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [inView, threshold]);

    return [ref, inView];
}
