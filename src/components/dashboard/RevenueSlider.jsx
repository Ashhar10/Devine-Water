import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, DollarSign, Clock } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import styles from './RevenueSlider.module.css'

function RevenueSlider({ revenue, outstanding }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const slides = [
        {
            title: 'Monthly Revenue',
            value: revenue,
            icon: DollarSign,
            color: 'income',
            trend: 15.7 // Using static trend from previous code for now
        },
        {
            title: 'Outstanding Balance',
            value: outstanding,
            icon: Clock,
            color: 'warning',
            trend: -5.2 // Example trend
        }
    ]

    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isPaused, slides.length])

    const nextSlide = (e) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = (e) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const currentSlide = slides[currentIndex]

    return (
        <div
            className={styles.sliderContainer}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <GlassCard className={`${styles.sliderCard} ${styles[currentSlide.color]}`}>
                <div className={styles.controls}>
                    <button className={styles.navBtn} onClick={prevSlide}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className={styles.navBtn} onClick={nextSlide}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={styles.content}
                    >
                        <div className={styles.header}>
                            <div className={`${styles.iconWrapper} ${styles[currentSlide.color]}`}>
                                <currentSlide.icon size={20} />
                            </div>
                            <span className={styles.title}>{currentSlide.title}</span>
                        </div>

                        <div className={styles.body}>
                            <span className={styles.currency}>Rs</span>
                            <span className={styles.value}>{currentSlide.value.toLocaleString()}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className={styles.indicators}>
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export default RevenueSlider
