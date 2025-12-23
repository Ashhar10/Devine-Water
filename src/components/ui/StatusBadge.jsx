import styles from './StatusBadge.module.css'

/**
 * StatusBadge - Status chip component for orders, payments, etc.
 */
function StatusBadge({ status, size = 'md' }) {
    const statusMap = {
        delivered: { label: 'Delivered', variant: 'success' },
        completed: { label: 'Completed', variant: 'success' },
        paid: { label: 'Paid', variant: 'success' },
        active: { label: 'Active', variant: 'success' },
        pending: { label: 'Pending', variant: 'warning' },
        processing: { label: 'Processing', variant: 'warning' },
        in_progress: { label: 'In Progress', variant: 'warning' },
        cancelled: { label: 'Cancelled', variant: 'error' },
        failed: { label: 'Failed', variant: 'error' },
        overdue: { label: 'Overdue', variant: 'error' },
        inactive: { label: 'Inactive', variant: 'neutral' },
        draft: { label: 'Draft', variant: 'neutral' },
    }

    const config = statusMap[status?.toLowerCase()] || { label: status, variant: 'neutral' }
    const sizeClass = styles[`size-${size}`] || styles['size-md']

    return (
        <span className={`${styles.badge} ${styles[config.variant]} ${sizeClass}`}>
            <span className={styles.dot} />
            {config.label}
        </span>
    )
}

export default StatusBadge
