import { motion } from 'framer-motion'
import styles from './Button.module.css'

/**
 * Button - Premium button component with glow effects
 * Supports multiple variants: primary, secondary, success, danger, ghost
 */
function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = ''
}) {
    const variantClass = styles[variant] || styles.primary
    const sizeClass = styles[`size-${size}`] || styles['size-md']
    const fullWidthClass = fullWidth ? styles.fullWidth : ''
    const disabledClass = disabled || loading ? styles.disabled : ''

    return (
        <motion.button
            type={type}
            className={`${styles.button} ${variantClass} ${sizeClass} ${fullWidthClass} ${disabledClass} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        >
            {loading ? (
                <span className={styles.loader} />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && (
                        <Icon className={styles.icon} size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
                    )}
                    <span className={styles.label}>{children}</span>
                    {Icon && iconPosition === 'right' && (
                        <Icon className={styles.icon} size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
                    )}
                </>
            )}
        </motion.button>
    )
}

export default Button
