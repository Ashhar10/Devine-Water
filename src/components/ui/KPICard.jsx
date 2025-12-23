import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'
import styles from './KPICard.module.css'

/**
 * KPICard - Dashboard metric card with animated counter
 * Displays large prominent numbers with trend indicators
 */
function KPICard({
    title,
    value,
    unit = '',
    prefix = '',
    icon: Icon,
    trend,
    trendValue,
    color = 'cyan',
    delay = 0,
    className = ''
}) {
    const [displayValue, setDisplayValue] = useState(0)

    // Animate counter on mount
    useEffect(() => {
        const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
        const duration = 1500
        const steps = 60
        const increment = numericValue / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= numericValue) {
                setDisplayValue(numericValue)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value])

    const formatValue = (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
        return val.toLocaleString()
    }

    const colorClass = styles[`color-${color}`] || styles['color-cyan']
    const trendClass = trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : ''

    return (
        <GlassCard className={`${styles.card} ${className}`} delay={delay} hover>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {Icon && (
                    <motion.div
                        className={`${styles.iconWrapper} ${colorClass}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <Icon size={22} />
                    </motion.div>
                )}
            </div>

            <div className={styles.valueContainer}>
                <motion.span
                    className={`${styles.value} ${colorClass}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.2, duration: 0.5 }}
                >
                    {prefix}{formatValue(displayValue)}{unit && <span className={styles.unit}>{unit}</span>}
                </motion.span>
            </div>

            {trend && trendValue && (
                <div className={`${styles.trend} ${trendClass}`}>
                    <span className={styles.trendIcon}>{trend === 'up' ? '↑' : '↓'}</span>
                    <span>{trendValue}% from last month</span>
                </div>
            )}
        </GlassCard>
    )
}

export default KPICard
