import { useEffect, useRef, useState } from 'react';

// Hook Intersection Observer untuk deteksi elemen masuk/keluar viewport
// Animasi bakal replay tiap kali elemen masuk viewport lagi
export function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return [ref, inView];
}
