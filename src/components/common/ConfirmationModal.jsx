import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger' // danger, warning, info
}) => {
    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={e => e.stopPropagation()}
                    style={{ width: '100%', maxWidth: '400px' }}
                >
                    <GlassCard>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: type === 'danger' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 204, 0, 0.1)',
                                    color: type === 'danger' ? '#ff3b30' : '#ffcc00',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AlertTriangle size={20} />
                                </div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{title}</h3>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: '1.5' }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={onClose}>
                                {cancelText}
                            </Button>
                            <Button
                                variant={type === 'danger' ? 'danger' : 'primary'}
                                onClick={() => { onConfirm(); onClose(); }}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}

export default ConfirmationModal
