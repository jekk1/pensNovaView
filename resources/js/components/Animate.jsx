import { useInView } from '../lib/useInView';

// Komponen wrapper untuk animasi scroll-reveal
export default function Animate({
    children,
    variant = 'fade-up',
    delay = 0,
    className = '',
    as: Tag = 'div',
    threshold = 0.12,
    ...props
}) {
    const [ref, inView] = useInView(threshold);

    const variantClass = inView ? `anim-${variant}` : 'anim-hidden';
    const delayClass = delay > 0 ? `anim-delay-${delay}` : '';

    return (
        <Tag
            ref={ref}
            className={`${variantClass} ${delayClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </Tag>
    );
}
