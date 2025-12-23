import { motion } from 'framer-motion'
import styles from './GlassCard.module.css'

/**
 * GlassCard - Floating glassmorphism card component
 * Core UI element of the Antigravity design system
 */
function GlassCard({
    children,
    className = '',
    hover = true,
    glow = false,
    glowColor = 'cyan',
    padding = 'md',
    onClick,
    animate = true,
    delay = 0
}) {
    const paddingClass = styles[`padding-${padding}`] || styles['padding-md']
    const glowClass = glow ? styles[`glow-${glowColor}`] : ''
    const hoverClass = hover ? styles.hoverable : ''
    const clickableClass = onClick ? styles.clickable : ''

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: delay,
                ease: [0.34, 1.56, 0.64, 1]
            }
        }
    }

    if (animate) {
        return (
            <motion.div
                className={`${styles.card} ${paddingClass} ${glowClass} ${hoverClass} ${clickableClass} ${className}`}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={hover ? { y: -4, scale: 1.01 } : {}}
                whileTap={onClick ? { scale: 0.98 } : {}}
                onClick={onClick}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <div
            className={`${styles.card} ${paddingClass} ${glowClass} ${hoverClass} ${clickableClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export default GlassCard
