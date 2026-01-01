import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import GlassCard from './GlassCard'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger' // 'danger', 'warning', 'info'
}) {
    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GlassCard className={styles.dialog}>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={18} />
                            </button>

                            <div className={`${styles.iconWrapper} ${styles[variant]}`}>
                                <AlertTriangle size={32} />
                            </div>

                            <h3 className={styles.title}>{title}</h3>
                            <p className={styles.message}>{message}</p>

                            <div className={styles.actions}>
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    className={styles.cancelBtn}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    variant={variant === 'danger' ? 'danger' : 'primary'}
                                    onClick={handleConfirm}
                                    className={styles.confirmBtn}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default ConfirmDialog
