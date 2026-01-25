import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import styles from './StatSlider.module.css'

/**
 * Generic Slider for Dashboard Stats
 * @param {Array} slides - Array of objects: { title, value, icon, color, prefix }
 * @param {number} interval - Auto-slide interval in ms (default: 5000)
 */
function StatSlider({ slides = [], interval = 5000 }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        if (isPaused || slides.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, interval)

        return () => clearInterval(timer)
    }, [isPaused, slides.length, interval])

    const nextSlide = (e) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = (e) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    }

    if (!slides.length) return null

    const currentSlide = slides[currentIndex]
    const Icon = currentSlide.icon

    return (
        <div
            className={styles.sliderContainer}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <GlassCard className={`${styles.sliderCard} ${styles[currentSlide.color] || styles.cyan}`}>
                {slides.length > 1 && (
                    <div className={styles.controls}>
                        <button className={styles.navBtn} onClick={prevSlide}>
                            <ChevronLeft size={16} />
                        </button>
                        <button className={styles.navBtn} onClick={nextSlide}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

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
                            <div className={`${styles.iconWrapper} ${styles[currentSlide.color] || styles.cyan}`}>
                                {Icon && <Icon size={20} />}
                            </div>
                            <span className={styles.title}>{currentSlide.title}</span>
                        </div>

                        <div className={styles.body}>
                            {currentSlide.prefix && <span className={styles.currency}>{currentSlide.prefix}</span>}
                            <span className={typeof currentSlide.value === 'number' ? styles.value : styles.textValue}>
                                {typeof currentSlide.value === 'number' ? currentSlide.value.toLocaleString() : currentSlide.value}
                            </span>
                            {currentSlide.suffix && <span className={styles.currency}>{currentSlide.suffix}</span>}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                {slides.length > 1 && (
                    <div className={styles.indicators}>
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    )
}

export default StatSlider
